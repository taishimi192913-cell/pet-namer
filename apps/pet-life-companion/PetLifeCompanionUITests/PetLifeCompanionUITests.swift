import XCTest

@MainActor
final class PetLifeCompanionUITests: XCTestCase {
    override func setUp() {
        super.setUp()
        continueAfterFailure = false
    }

    func testOnboardingCompletesAndPrimaryTabsAreReachable() {
        let app = launchFreshApp()

        XCTAssertTrue(app.staticTexts["うちの子日記"].waitForExistence(timeout: 8))
        app.buttons["onboardingPrimaryButton"].tap()

        let nameField = app.textFields["例: こむぎ"]
        XCTAssertTrue(nameField.waitForExistence(timeout: 4))
        nameField.tap()
        nameField.typeText("こむぎ")
        app.keyboards.buttons["次へ"].tap()
        dismissKeyboardIfNeeded(in: app)

        XCTAssertTrue(app.buttons["onboardingPrimaryButton"].waitForExistence(timeout: 4))
        app.buttons["onboardingPrimaryButton"].tap()
        dismissKeyboardIfNeeded(in: app)

        XCTAssertTrue(app.navigationBars["今日"].waitForExistence(timeout: 8))
        XCTAssertTrue(app.tabBars.buttons["健康"].waitForExistence(timeout: 4))

        for tabTitle in ["日記", "健康", "相談", "共有", "ホーム"] {
            tapTab(tabTitle, in: app)
            XCTAssertTrue(app.navigationBars[navigationTitle(for: tabTitle)].waitForExistence(timeout: 4))
        }
    }

    func testSampleDataAllowsQuickRecordAndTalkPromptAtAccessibilityTextSize() {
        let app = launchFreshApp(
            arguments: [
                "-UIPreferredContentSizeCategoryName",
                "UICTContentSizeCategoryAccessibilityXXXL"
            ]
        )

        XCTAssertTrue(app.buttons["サンプルで見る"].waitForExistence(timeout: 8))
        app.buttons["サンプルで見る"].tap()
        XCTAssertTrue(app.navigationBars["今日"].waitForExistence(timeout: 8))

        let recordButton = app.buttons["quickRecordAddButton"]
        XCTAssertTrue(recordButton.waitForExistence(timeout: 4))
        recordButton.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
        XCTAssertTrue(app.staticTexts["最近の記録"].waitForExistence(timeout: 4))

        app.tabBars.buttons["相談"].tap()
        XCTAssertTrue(app.navigationBars["相談メモ"].waitForExistence(timeout: 4))
        let prompt = app.buttons["病院で伝えることをまとめて"]
        XCTAssertTrue(prompt.waitForExistence(timeout: 4))
        prompt.tap()
        XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label CONTAINS %@", "診断ではなく")).firstMatch.waitForExistence(timeout: 4))
    }

    private func launchFreshApp(arguments: [String] = []) -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = arguments
        app.launchEnvironment["PET_LIFE_UI_TEST_RESET_STORE"] = "1"
        app.launchEnvironment["PET_LIFE_UI_TEST_DISABLE_TIPS"] = "1"
        app.launch()
        return app
    }

    private func dismissKeyboardIfNeeded(in app: XCUIApplication) {
        guard app.keyboards.firstMatch.exists else { return }
        app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.12)).tap()
    }

    private func tapTab(_ title: String, in app: XCUIApplication) {
        let button = app.tabBars.buttons[title]
        XCTAssertTrue(button.waitForExistence(timeout: 4))
        button.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
    }

    private func navigationTitle(for tabTitle: String) -> String {
        switch tabTitle {
        case "ホーム": "今日"
        case "相談": "相談メモ"
        default: tabTitle
        }
    }
}
