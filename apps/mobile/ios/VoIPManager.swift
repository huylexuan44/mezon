import Foundation
import PushKit
import CallKit
import React

@objc(VoIPManager)
class VoIPManager: RCTEventEmitter, PKPushRegistryDelegate {

    private var pushRegistry: PKPushRegistry?
    private var hasListeners = false
    private let notificationDataKey = "notificationDataCalling"
    private let activeCallUUIDKey = "activeCallUUID"

    override init() {
        super.init()
        setupPushRegistry()
    }

    // MARK: - React Native Bridge Methods

    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc
    override func supportedEvents() -> [String]! {
        return [
            "VoIPTokenReceived",
            "VoIPNotificationReceived",
            "VoIPCallEnded"
        ]
    }

    override func startObserving() {
        hasListeners = true
    }

    override func stopObserving() {
        hasListeners = false
    }

    // MARK: - Exposed Methods to React Native

    @objc
    func registerForVoIPPushes(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.pushRegistry?.desiredPushTypes = [.voIP]
            resolve("VoIP registration initiated")
        }
    }

    @objc
    func getVoIPToken(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let token = pushRegistry?.pushToken(for: .voIP) else {
            reject("NO_TOKEN", "VoIP token not available", nil)
            return
        }

        let tokenString = token.map { String(format: "%02x", $0) }.joined()
        resolve(tokenString)
    }

    @objc
    func getStoredNotificationData(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        if let data = UserDefaults.standard.object(forKey: notificationDataKey) as? [String: Any] {
            resolve(data)
        } else {
            resolve(NSNull())
        }
    }

    @objc
    func clearStoredNotificationData(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        UserDefaults.standard.removeObject(forKey: notificationDataKey)
        UserDefaults.standard.synchronize()
        resolve("Notification data cleared")
    }

    @objc
    func getActiveCallUUID(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        if let uuid = UserDefaults.standard.string(forKey: activeCallUUIDKey) {
            resolve(uuid)
        } else {
            resolve(NSNull())
        }
    }

    private func storeNotificationData(_ data: [String: Any]) {
        UserDefaults.standard.set(data, forKey: notificationDataKey)
        UserDefaults.standard.synchronize()
        print("log  => Notification data stored: \(data)")
    }

    private func clearStoredNotificationDataInternal() {
         UserDefaults.standard.removeObject(forKey: notificationDataKey)
         UserDefaults.standard.synchronize()
         print("log  => Stored notification data cleared internally")
    }

     // Helper method to store active call UUID
     private func storeActiveCallUUID(_ uuid: String) {
         UserDefaults.standard.set(uuid, forKey: activeCallUUIDKey)
         UserDefaults.standard.synchronize()
         print("log  => Active call UUID stored: \(uuid)")
     }

     // Helper method to get active call UUID
     private func getActiveCallUUID() -> String? {
         return UserDefaults.standard.string(forKey: activeCallUUIDKey)
     }

    // MARK: - Private Methods

    private func setupPushRegistry() {
        pushRegistry = PKPushRegistry(queue: DispatchQueue.main)
        pushRegistry?.delegate = self
        pushRegistry?.desiredPushTypes = [.voIP]
    }

    // MARK: - PKPushRegistryDelegate

    func pushRegistry(_ registry: PKPushRegistry, didUpdate pushCredentials: PKPushCredentials, for type: PKPushType) {
        if type == .voIP {
            let token = pushCredentials.token
            let tokenString = token.map { String(format: "%02x", $0) }.joined()

            print("log  => VoIP Token: \(tokenString)")

            if hasListeners {
                sendEvent(withName: "VoIPTokenReceived", body: ["token": tokenString])
            }
        }
    }

    func pushRegistry(_ registry: PKPushRegistry, didInvalidatePushTokenFor type: PKPushType) {
        if type == .voIP {
            print("log  => VoIP token invalidated")
        }
    }

    func pushRegistry(_ registry: PKPushRegistry, didReceiveIncomingPushWith payload: PKPushPayload, for type: PKPushType, completion: @escaping () -> Void) {
        if type == .voIP {
            handleVoIPNotification(payload: payload, completion: completion)
        }
    }

    // iOS 11+ method
    func pushRegistry(_ registry: PKPushRegistry, didReceiveIncomingPushWith payload: PKPushPayload, for type: PKPushType) {
        if type == .voIP {
            handleVoIPNotification(payload: payload) { }
        }
    }

    // MARK: - VoIP Notification Handling

    private func handleVoIPNotification(payload: PKPushPayload, completion: @escaping () -> Void) {
        let appState = UIApplication.shared.applicationState
        let payloadDict = payload.dictionaryPayload

         // Only proceed if the app is in the background or killed
        guard appState == .background else {
           print("log  => App is in the foreground, skipping logic")
           completion()
           return
        }

        guard let offerValue = payloadDict["offer"] else {
            print("log  => No 'offer' key found in payload")
            // Even if there's no offer, we need to report something to CallKit to avoid crash
            reportDummyCall(completion: completion)
            return
        }
        let callUUID = UUID().uuidString

        var callerName = "Unknown"
        var offer = ""
        var callerAvatar = ""
        var callerId = ""
        var channelId = ""

        if let offerString = offerValue as? String,
           let offerData = offerString.data(using: .utf8),
           let offerDict = try? JSONSerialization.jsonObject(with: offerData) as? [String: Any] {
            offer = offerDict["offer"] as? String ?? ""
            callerName = offerDict["callerName"] as? String ?? "Unknown"
            callerAvatar = offerDict["callerAvatar"] as? String ?? ""
            callerId = offerDict["callerId"] as? String ?? ""
            channelId = offerDict["channelId"] as? String ?? ""
        } else if let offerDict = offerValue as? [String: Any] {
            offer = offerDict["offer"] as? String ?? ""
            callerName = offerDict["callerName"] as? String ?? "Unknown"
            callerAvatar = offerDict["callerAvatar"] as? String ?? ""
            callerId = offerDict["callerId"] as? String ?? ""
            channelId = offerDict["channelId"] as? String ?? ""
        } else {
            print("log  => Unexpected format for 'offer': \(type(of: offerValue))")
            dump(offerValue)
            reportDummyCall(completion: completion)
            return
        }

        print("log  => Caller Name: \(callerName)")
        print("log  => Caller Avatar: \(callerAvatar)")
        print("log  => Caller ID: \(callerId)")
        print("log  => Channel ID: \(channelId)")
        print("log  => offer \(offer)")

        if offer == "CANCEL_CALL" {
            print("log  => Cancel call received")
            if let activeUUID = getActiveCallUUID() {
                print("log  => Ending call with UUID: \(activeUUID)")
                RNCallKeep.endCall(withUUID: activeUUID, reason: 6)
                RNCallKeep.endCall(withUUID: "0731961b-415b-44f3-a960-dd94ef3372fc", reason: 6)
                clearStoredNotificationDataInternal()
            } else {
                print("log  => No active call UUID found, cannot end call")
                clearStoredNotificationDataInternal()
            }
            return
        }

        // Prepare notification data to store
         let notificationData: [String: Any] = [
             "callerId": callerId,
             "callerName": callerName,
             "callerAvatar": callerAvatar,
             "channelId": channelId,
             "callUUID": callUUID,
             "offer": offer
         ]

        storeNotificationData(notificationData)
        storeActiveCallUUID(callUUID)
        // Report the incoming call to CallKit - THIS IS MANDATORY to avoid crash
        RNCallKeep.reportNewIncomingCall(
            callUUID,
            handle: callerId.isEmpty ? callerName : callerId,
            handleType: "generic",
            hasVideo: true,
            localizedCallerName: callerName,
            supportsHolding: true,
            supportsDTMF: true,
            supportsGrouping: false,
            supportsUngrouping: false,
            fromPushKit: true,
            payload: payloadDict,
            withCompletionHandler: {
                print("log  => Incoming call reported successfully with UUID: \(callUUID)")
            }
        )
        completion()
    }

    // Helper method to report a dummy call when payload is invalid
    private func reportDummyCall(completion: @escaping () -> Void) {
        let callUUID = UUID().uuidString

        RNCallKeep.reportNewIncomingCall(
            callUUID,
            handle: "Unknown",
            handleType: "generic",
            hasVideo: true,
            localizedCallerName: "Unknown Caller",
            supportsHolding: true,
            supportsDTMF: true,
            supportsGrouping: false,
            supportsUngrouping: false,
            fromPushKit: true,
            payload: nil,
            withCompletionHandler: {
                print("log  => Dummy call reported to avoid crash")
                // Immediately end the dummy call
                RNCallKeep.endCall(withUUID: callUUID, reason: 6)
            }
        )
        completion()
    }
}
