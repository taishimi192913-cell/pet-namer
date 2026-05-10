import SwiftUI

struct TalkView: View {
    @EnvironmentObject private var store: PetStore
    @State private var message = ""

    private let prompts = [
        "病院で伝えることをまとめて",
        "最近の食欲について見て",
        "咳や吐き戻しの記録を整理して"
    ]

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ScrollView {
                    VStack(spacing: 16) {
                        introCard

                        ForEach(store.chatMessages) { chat in
                            ChatBubbleView(message: chat)
                        }
                    }
                    .padding(AppTheme.screenPadding)
                }

                chatInput
            }
            .background(AppTheme.canvas.ignoresSafeArea())
            .navigationTitle("相談メモ")
        }
    }

    private var introCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            SectionHeaderView(
                eyebrow: "相談メモ",
                title: "診断ではなく、記録を整理する場所",
                detail: "\(store.selectedPet.name)の最近の記録をもとに、病院で伝えること、家族に共有すること、次に残すとよいメモを短くまとめます。"
            )

            FlowPromptButtons(prompts: prompts) { prompt in
                store.sendPrompt(prompt)
            }

            Text("医療判断や診断は行いません。気になる症状が続く場合は獣医師に相談してください。")
                .font(.caption)
                .foregroundStyle(AppTheme.muted)
                .padding(.top, 8)
                .overlay(alignment: .top) {
                    Rectangle()
                        .fill(AppTheme.line)
                        .frame(height: 1)
                }
        }
        .padding(AppTheme.cardPadding)
        .background(AppTheme.mist)
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadius, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: AppTheme.cornerRadius, style: .continuous)
                .stroke(AppTheme.line, lineWidth: 1)
        }
    }

    private var chatInput: some View {
        HStack(spacing: 8) {
            TextField("\(store.selectedPet.name)について聞きたいこと", text: $message, axis: .vertical)
                .lineLimit(1...3)
                .padding(16)
                .background(AppTheme.elevated)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .overlay {
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .stroke(AppTheme.line, lineWidth: 1)
                }

            Button {
                store.sendPrompt(message)
                message = ""
            } label: {
                Image(systemName: "arrow.up")
                    .font(.headline)
                    .frame(width: 44, height: 44)
            }
            .buttonStyle(.borderedProminent)
            .tint(AppTheme.brandOrange)
            .clipShape(Circle())
            .accessibilityLabel("送信する")
            .sensoryFeedback(.success, trigger: store.chatMessages.count)
        }
        .padding(AppTheme.screenPadding)
        .background(.regularMaterial)
    }
}

struct ChatBubbleView: View {
    let message: ChatMessage

    var body: some View {
        VStack(alignment: message.role == .user ? .trailing : .leading, spacing: 8) {
            Text(message.body)
                .font(AppTheme.bodyText())
                .lineSpacing(4)
                .foregroundStyle(message.role == .user ? AppTheme.brandDarkBrown : AppTheme.ink)
                .padding(16)
                .background(message.role == .user ? AppTheme.brandOrange : AppTheme.surface)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .overlay {
                    if message.role == .assistant {
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .stroke(AppTheme.line, lineWidth: 1)
                    }
                }

            if message.role == .assistant && !message.references.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("参照した記録")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(AppTheme.brandOrange)
                    ForEach(message.references) { entry in
                        Text("\(entry.timeText) / \(entry.title)")
                            .font(.caption)
                            .foregroundStyle(AppTheme.muted)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(AppTheme.surface)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay {
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(AppTheme.line, lineWidth: 1)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: message.role == .user ? .trailing : .leading)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(message.role == .user ? "自分のメッセージ" : "相談メモの返答")。\(message.body)")
    }
}

struct FlowPromptButtons: View {
    let prompts: [String]
    let onSelect: (String) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ForEach(prompts, id: \.self) { prompt in
                Button(prompt) {
                    onSelect(prompt)
                }
                .font(.subheadline.weight(.bold))
                .foregroundStyle(AppTheme.ink)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .frame(minHeight: 44)
                .background(AppTheme.surface)
                .clipShape(Capsule())
                .overlay {
                    Capsule().stroke(AppTheme.line, lineWidth: 1)
                }
                .contentShape(Capsule())
                .buttonStyle(.bordered)
                .tint(AppTheme.brandOrange)
            }
        }
    }
}
