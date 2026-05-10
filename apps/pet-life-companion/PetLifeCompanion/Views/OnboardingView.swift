import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject private var store: PetStore

    @State private var step = 0
    @State private var petName = ""
    @State private var species: PetSpecies = .dog
    @State private var breed = ""
    @State private var sex: PetSex = .unknown
    @State private var selectedCategories: Set<DiaryCategory> = [.food, .symptom, .medicine, .walk]

    private let stepCount = 4

    var body: some View {
        VStack(spacing: 0) {
            progressHeader

            TabView(selection: $step) {
                landingStep.tag(0)
                profileStep.tag(1)
                trackingStep.tag(2)
                sippomiStep.tag(3)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .animation(AppTheme.spring, value: step)
            .background(AppTheme.canvas)
            .sensoryFeedback(.selection, trigger: step)

            footer
        }
        .background(AppTheme.canvas.ignoresSafeArea())
    }

    private var progressHeader: some View {
        VStack(spacing: 16) {
            HStack {
                Text("うちの子日記")
                    .font(.headline)
                    .foregroundStyle(AppTheme.brandOrange)

                Spacer()

                Button("サンプルで見る") {
                    store.previewWithSampleData()
                }
                .font(.subheadline.weight(.semibold))
                .buttonStyle(.bordered)
                .tint(AppTheme.brandOrange)
            }

            ProgressView(value: Double(step + 1), total: Double(stepCount))
                .tint(AppTheme.brandOrange)
        }
        .padding(.horizontal, AppTheme.screenPadding)
        .padding(.top, 16)
        .padding(.bottom, 8)
        .background(AppTheme.canvas)
    }

    private var landingStep: some View {
        OnboardingStepContainer {
            VStack(alignment: .leading, spacing: 24) {
                Spacer(minLength: 10)

                ZStack {
                    RoundedRectangle(cornerRadius: 34, style: .continuous)
                        .fill(AppTheme.mist)
                        .frame(width: 108, height: 108)

                    Image(systemName: "pawprint.fill")
                        .font(.system(size: 48, weight: .semibold))
                        .foregroundStyle(AppTheme.brandOrange)
                }

                Image("heroAsset")
                    .resizable()
                    .scaledToFill()
                    .frame(height: 160)
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .accessibilityHidden(true)

                VStack(alignment: .leading, spacing: 16) {
                    Text("毎日の小さな変化を、病院で役立つ記録に。")
                        .font(AppTheme.titleLarge())
                        .foregroundStyle(AppTheme.ink)
                        .fixedSize(horizontal: false, vertical: true)

                    Text("ごはん、体調、薬、通院メモを短く残して、家族でも見返しやすく整理します。")
                        .font(AppTheme.bodyText())
                        .foregroundStyle(AppTheme.muted)
                        .lineSpacing(4)
                }

                VStack(spacing: 16) {
                    OnboardingFeatureRow(
                        icon: "square.and.pencil",
                        title: "30秒で今日の記録",
                        description: "食欲や体調を選んで、必要な時だけメモを追加。"
                    )
                    OnboardingFeatureRow(
                        icon: "heart.text.square.fill",
                        title: "変化に気づく",
                        description: "体重、症状、薬の記録をペットごとに整理。"
                    )
                    OnboardingFeatureRow(
                        icon: "stethoscope",
                        title: "病院前メモ",
                        description: "診察で伝える内容を短くまとめて確認。"
                    )
                }

                Spacer(minLength: 10)
            }
        }
    }

    private var profileStep: some View {
        OnboardingStepContainer {
            VStack(alignment: .leading, spacing: 24) {
                stepTitle("まず、うちの子のことを教えてください", subtitle: "あとからいつでも変更できます。最初は最低限で十分です。")

                VStack(alignment: .leading, spacing: 16) {
                    Text("名前")
                        .font(.subheadline.weight(.semibold))
                    TextField("例: こむぎ", text: $petName)
                        .textFieldStyle(.roundedBorder)
                        .font(.title3.weight(.medium))
                        .submitLabel(.next)
                        .onSubmit {
                            guard canContinue else { return }
                            primaryAction()
                        }
                }

                if !store.nameSuggestions.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("名前の候補")
                            .font(.subheadline.weight(.semibold))
                        ForEach(store.nameSuggestions.prefix(2)) { suggestion in
                            Button {
                                petName = suggestion.name
                            } label: {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("\(suggestion.name) / \(suggestion.petType)")
                                        .font(.headline)
                                    Text("\(suggestion.tone)。\(suggestion.reason)")
                                        .font(.footnote)
                                        .foregroundStyle(AppTheme.muted)
                                        .fixedSize(horizontal: false, vertical: true)
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                            }
                            .buttonStyle(.bordered)
                            .tint(AppTheme.brandOrange)
                        }
                    }
                }

                VStack(alignment: .leading, spacing: 16) {
                    Text("種類")
                        .font(.subheadline.weight(.semibold))
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 96), spacing: 8)], spacing: 8) {
                        ForEach(PetSpecies.allCases) { item in
                            SelectableChip(
                                title: item.rawValue,
                                icon: item.symbolName,
                                isSelected: species == item
                            ) {
                                species = item
                            }
                        }
                    }
                }

                VStack(alignment: .leading, spacing: 16) {
                    Text("犬種・猫種")
                        .font(.subheadline.weight(.semibold))
                    TextField("例: 柴犬、ミックス", text: $breed)
                        .textFieldStyle(.roundedBorder)
                        .font(.body.weight(.medium))
                        .submitLabel(.done)
                        .onSubmit {
                            guard canContinue else { return }
                            primaryAction()
                        }
                }

                VStack(alignment: .leading, spacing: 16) {
                    Text("性別")
                        .font(.subheadline.weight(.semibold))
                    Picker("性別", selection: $sex) {
                        ForEach(PetSex.allCases) { item in
                            Text(item.rawValue).tag(item)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                Spacer()
            }
        }
    }

    private var trackingStep: some View {
        OnboardingStepContainer {
            VStack(alignment: .leading, spacing: 24) {
                stepTitle("今日から記録する項目を選びます", subtitle: "ごはん、体調、薬など、よく使うボタンだけ最初に用意します。")

                LazyVGrid(columns: [GridItem(.adaptive(minimum: 144), spacing: 16)], spacing: 16) {
                    ForEach(Self.trackingCategories) { category in
                        SelectableLargeChip(
                            title: category.rawValue,
                            icon: category.iconName,
                            isSelected: selectedCategories.contains(category)
                        ) {
                            toggle(category)
                        }
                    }
                }

                Text("写真、詳しい医療情報、家族招待は初回記録のあとで追加できます。")
                    .font(.footnote.weight(.medium))
                    .foregroundStyle(AppTheme.muted)
                    .padding(.top, 4)

                Spacer()
            }
        }
    }

    private var sippomiStep: some View {
        OnboardingStepContainer {
            VStack(alignment: .leading, spacing: 24) {
                Spacer(minLength: 10)

                Image("onboarding1")
                    .resizable()
                    .scaledToFill()
                    .frame(height: 200)
                    .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                    .accessibilityHidden(true)

                VStack(alignment: .leading, spacing: 16) {
                    Text("Sippomiで診断した名前をお持ちですか？")
                        .font(.title.weight(.bold))
                        .foregroundStyle(AppTheme.ink)
                        .fixedSize(horizontal: false, vertical: true)

                    Text("AIがあなたのペットにぴったりの名前を提案します。診断した名前をそのまま「うちの子日記」に登録できます。")
                        .font(AppTheme.bodyText())
                        .foregroundStyle(AppTheme.muted)
                        .lineSpacing(4)
                }

                Link(destination: URL(string: "https://sippomi.com")!) {
                    HStack {
                        Image(systemName: "pawprint.fill")
                        Text("Sippomiで名前を診断する")
                        Spacer()
                        Image(systemName: "arrow.up.forward.app")
                    }
                    .font(.headline)
                    .padding(.vertical, 16)
                    .padding(.horizontal, 24)
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(AppTheme.brandCta)
                .clipShape(RoundedRectangle(cornerRadius: AppTheme.pillRadius, style: .continuous))

                Spacer(minLength: 10)
            }
        }
    }

    private var footer: some View {
        VStack(spacing: 16) {
            Button {
                primaryAction()
            } label: {
                HStack {
                    Spacer()
                    Text(step == stepCount - 1 ? "記録をはじめる" : "次へ")
                        .font(.headline)
                    Image(systemName: step == stepCount - 1 ? "checkmark" : "chevron.right")
                        .font(.system(size: 15, weight: .bold))
                    Spacer()
                }
                .padding(.vertical, 16)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            .tint(canContinue ? AppTheme.brandOrange : Color(.systemGray3))
            .disabled(!canContinue)
            .accessibilityIdentifier("onboardingPrimaryButton")
            .sensoryFeedback(.success, trigger: store.hasCompletedOnboarding)

            if step > 0 {
                Button("戻る") {
                    withAnimation(AppTheme.spring) {
                        step -= 1
                    }
                }
                .font(.subheadline.weight(.semibold))
                .buttonStyle(.bordered)
                .tint(AppTheme.brandOrange)
            }
        }
        .padding(.horizontal, AppTheme.screenPadding)
        .padding(.top, 16)
        .padding(.bottom, 16)
        .background(AppTheme.canvas)
    }

    private var canContinue: Bool {
        switch step {
        case 1:
            !petName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        case 2:
            !selectedCategories.isEmpty
        default:
            true
        }
    }

    private func primaryAction() {
        guard canContinue else { return }
        if step == stepCount - 1 {
            store.completeOnboarding(
                name: petName,
                species: species,
                breed: breed,
                sex: sex,
                trackedCategories: selectedCategories
            )
        } else {
            withAnimation(AppTheme.spring) {
                step += 1
            }
        }
    }

    private func stepTitle(_ title: String, subtitle: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.title.weight(.bold))
                .foregroundStyle(AppTheme.ink)
                .fixedSize(horizontal: false, vertical: true)
            Text(subtitle)
                .font(AppTheme.bodyText())
                .foregroundStyle(AppTheme.muted)
                .lineSpacing(4)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private func toggle(_ category: DiaryCategory) {
        if selectedCategories.contains(category) {
            selectedCategories.remove(category)
        } else {
            selectedCategories.insert(category)
        }
    }

    private static let trackingCategories: [DiaryCategory] = [
        .food,
        .toilet,
        .symptom,
        .medicine,
        .walk,
        .vet
    ]
}

private struct OnboardingStepContainer<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        ScrollView {
            content
                .padding(.horizontal, AppTheme.screenPadding)
                .padding(.top, 16)
                .padding(.bottom, 24)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

private struct OnboardingFeatureRow: View {
    var icon: String
    var title: String
    var description: String

    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(AppTheme.brandOrange)
                .frame(width: 34, height: 34)
                .background(AppTheme.mist)
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                    .foregroundStyle(AppTheme.ink)
                Text(description)
                    .font(.footnote.weight(.medium))
                    .foregroundStyle(AppTheme.muted)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: 0)
        }
        .padding(16)
        .background(AppTheme.elevated)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}

private struct SelectableChip: View {
    var title: String
    var icon: String
    var isSelected: Bool
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.system(size: 20, weight: .semibold))
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .fixedSize(horizontal: false, vertical: true)
                    .minimumScaleFactor(0.85)
            }
            .frame(maxWidth: .infinity, minHeight: 72)
            .foregroundStyle(isSelected ? AppTheme.brandDarkBrown : AppTheme.ink)
            .background(isSelected ? AppTheme.brandOrange : AppTheme.elevated)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(isSelected ? AppTheme.brandOrange : AppTheme.line, lineWidth: 1)
            }
            .contentShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        }
        .buttonStyle(.bordered)
        .tint(isSelected ? AppTheme.brandOrange : AppTheme.muted)
        .selectedAccessibility(isSelected)
    }
}

private struct SelectableLargeChip: View {
    var title: String
    var icon: String
    var isSelected: Bool
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.system(size: 17, weight: .semibold))
                    .frame(width: 28, height: 28)
                Text(title)
                    .font(.body.weight(.semibold))
                    .fixedSize(horizontal: false, vertical: true)
                    .minimumScaleFactor(0.85)
                Spacer(minLength: 0)
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 16, weight: .semibold))
            }
            .padding(16)
            .foregroundStyle(isSelected ? AppTheme.brandOrange : AppTheme.ink)
            .background(isSelected ? AppTheme.mist : AppTheme.elevated)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(isSelected ? AppTheme.brandOrange.opacity(0.4) : AppTheme.line, lineWidth: 1)
            }
        }
        .buttonStyle(.bordered)
        .tint(isSelected ? AppTheme.brandOrange : AppTheme.muted)
        .selectedAccessibility(isSelected)
    }
}
