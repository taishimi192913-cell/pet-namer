import SwiftUI

struct SectionHeaderView: View {
    let eyebrow: String
    let title: String
    var detail: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(eyebrow)
                .font(.caption.weight(.bold))
                .textCase(.uppercase)
                .foregroundStyle(AppTheme.brandOrange)

            Text(title)
                .font(AppTheme.sectionTitle())
                .foregroundStyle(AppTheme.ink)

            if let detail {
                Text(detail)
                    .font(AppTheme.bodyText())
                    .foregroundStyle(AppTheme.muted)
                    .lineSpacing(4)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
