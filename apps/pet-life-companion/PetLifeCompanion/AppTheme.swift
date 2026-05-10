import SwiftUI

enum AppTheme {
    // Backgrounds (dark mode auto-adapting via named colors)
    static let canvas = Color("Canvas")               // Light: #f4eede / Dark: #2C241B
    static let surface = Color("Surface")             // Light: #FFF8F0 / Dark: #332B22
    static let elevated = Color(.systemBackground)    // Semantic — auto light/dark
    static let softSurface = Color("SoftSurface")     // Light: #f9f5eb / Dark: #3A3229
    static let mist = Color(.quaternarySystemFill)

    // Text (semantic — auto light/dark)
    static let ink = Color(.label)                    // Primary text
    static let muted = Color(.secondaryLabel)          // Secondary text
    static let line = Color(.separator).opacity(0.45)

    // Brand accents (dark mode auto-adapting via named colors)
    static let brandOrange = Color("BrandOrange")           // Soft warm orange
    static let brandTerracotta = Color("BrandTerracotta")   // Warm terracotta
    static let brandDarkBrown = Color("BrandDarkBrown")     // Light: dark brown / Dark: warm off-white
    static let brandCta = Color("BrandCTA")                 // Apple Blue
    static let onAccent = Color("BrandDarkBrown")           // Text on accent backgrounds (auto light/dark)

    // Layout
    static let screenPadding: CGFloat = 16
    static let cardPadding: CGFloat = 20
    static let cornerRadius: CGFloat = 20
    static let pillRadius: CGFloat = 9999

    // Typography
    static func titleLarge() -> Font { .largeTitle.weight(.bold) }
    static func sectionTitle() -> Font { .title3.weight(.semibold) }
    static func bodyText() -> Font { .body }

    // Animation
    static var spring: Animation { .spring(response: 0.36, dampingFraction: 0.82) }
}

extension View {
    func careCardStyle() -> some View {
        self
            .padding(AppTheme.cardPadding)
            .background(AppTheme.elevated)
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadius, style: .continuous))
            .shadow(color: .black.opacity(0.04), radius: 1, x: 0, y: 1)
            .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 4)
            .shadow(color: .black.opacity(0.05), radius: 18, x: 0, y: 12)
    }

    func selectedAccessibility(_ isSelected: Bool) -> some View {
        accessibilityAddTraits(isSelected ? .isSelected : [])
            .accessibilityValue(isSelected ? "選択中" : "")
    }
}
