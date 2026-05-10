import SwiftUI

struct CareTaskRow: View {
    let task: CareTask
    let onComplete: () -> Void

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: task.category.iconName)
                .font(.caption.weight(.bold))
                .foregroundStyle(AppTheme.brandOrange)
                .frame(width: 34, height: 34)
                .background(AppTheme.softSurface)
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: 4) {
                Text(task.title)
                    .font(.headline)
                    .foregroundStyle(AppTheme.ink)
                Text(task.dueText)
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.muted)
            }

            Spacer()

            Button {
                onComplete()
            } label: {
                Label("完了する", systemImage: "checkmark")
                    .frame(minHeight: 44)
                    .contentShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            }
            .font(.caption.weight(.bold))
            .buttonStyle(.bordered)
            .tint(AppTheme.brandOrange)
            .accessibilityHint("予定を完了として記録します")
        }
        .padding(.vertical, 8)
    }
}
