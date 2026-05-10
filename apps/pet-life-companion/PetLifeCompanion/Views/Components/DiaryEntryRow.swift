import SwiftUI

struct DiaryEntryRow: View {
    let entry: DiaryEntry

    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            Image(systemName: entry.category.iconName)
                .font(.caption.weight(.bold))
                .foregroundStyle(AppTheme.brandOrange)
                .frame(width: 30, height: 30)
                .background(AppTheme.softSurface)
                .clipShape(Circle())

            Text(entry.categoryLabel)
                .font(.caption.weight(.bold))
                .foregroundStyle(AppTheme.brandOrange)
                .lineLimit(2)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 8)
                .padding(.vertical, 8)
                .frame(minWidth: 58, minHeight: 30)
                .background(AppTheme.softSurface)
                .clipShape(Capsule())

            VStack(alignment: .leading, spacing: 8) {
                Text(entry.timeText)
                    .font(.caption)
                    .foregroundStyle(AppTheme.muted)
                Text(entry.title)
                    .font(.headline)
                    .foregroundStyle(AppTheme.ink)
                Text(entry.body)
                    .font(AppTheme.bodyText())
                    .foregroundStyle(AppTheme.muted)
                    .lineSpacing(4)
                HStack(spacing: 8) {
                    Text(entry.tag)
                    if let metric = entry.metricText {
                        Text(metric)
                    }
                    if let photo = entry.photoAttachmentName {
                        Label(photo, systemImage: "photo")
                    }
                }
                .fixedSize(horizontal: false, vertical: true)
                .font(.caption.weight(.bold))
                .foregroundStyle(AppTheme.brandOrange)
                .padding(.top, 4)
            }
        }
        .padding(.vertical, 16)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(entry.categoryLabel)、\(entry.title)、\(entry.body)")
    }
}
