import SwiftUI
import TipKit
import UIKit

@main
struct PetLifeCompanionApp: App {
    @StateObject private var store: PetStore
    @StateObject private var network: NetworkStatusMonitor
    @Environment(\.scenePhase) private var scenePhase

    init() {
        #if DEBUG
        let resetPersistentStore = ProcessInfo.processInfo.environment["PET_LIFE_UI_TEST_RESET_STORE"] == "1"
        let disableTips = ProcessInfo.processInfo.environment["PET_LIFE_UI_TEST_DISABLE_TIPS"] == "1"
        #else
        let resetPersistentStore = false
        let disableTips = false
        #endif

        _store = StateObject(wrappedValue: PetStore(resetPersistentStore: resetPersistentStore))
        _network = StateObject(wrappedValue: NetworkStatusMonitor())

        if disableTips {
            QuickLogTip.hasLoggedEntry = true
        }

        do {
            try Tips.configure()
        } catch {
            #if DEBUG
            assertionFailure("TipKit configuration failed: \(error)")
            #endif
        }
    }

    var body: some Scene {
        WindowGroup {
            Group {
                if store.hasCompletedOnboarding {
                    RootTabView()
                } else {
                    OnboardingView()
                }
            }
            .environmentObject(store)
            .environmentObject(network)
            .animation(AppTheme.spring, value: store.hasCompletedOnboarding)
            .onChange(of: scenePhase) { _, newPhase in
                guard newPhase == .active else { return }
                store.objectWillChange.send()
            }
            .onReceive(NotificationCenter.default.publisher(for: UIApplication.didReceiveMemoryWarningNotification)) { _ in
                URLCache.shared.removeAllCachedResponses()
            }
        }
    }
}
