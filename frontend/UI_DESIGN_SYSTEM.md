# EngFlex UI Design System

> Phiên bản: 1.1
> Ngày cập nhật implementation: 13/07/2026
> Nguồn chuẩn trực quan: route `/home`  
> Phạm vi: frontend web tại `frontend/`  
> Trạng thái: tài liệu chuẩn để thiết kế, triển khai và đánh giá UI; inventory bên dưới phản ánh product foundation đã có trong code tại ngày cập nhật.

## Cách đọc tài liệu

Tài liệu dùng năm nhãn để tránh nhầm giữa hiện trạng và đặc tả:

- **[Quan sát]**: có bằng chứng trực tiếp trong Home Page hoặc source hiện tại.
- **[Chuẩn hóa]**: quy tắc chính thức được gom từ các giá trị lặp lại trên Home Page.
- **[Suy ra]**: pattern Home chưa có, nhưng được đặc tả bằng chính màu, typography, spacing, surface và accessibility của Home.
- **[Đã triển khai]**: pattern đã có API/component cụ thể trong source và có thể được tái sử dụng.
- **[Khoảng trống]**: chưa có component/state hoàn chỉnh trong source; không được mô tả như thứ đã tồn tại.

Thứ tự ưu tiên khi có xung đột:

1. Quy tắc **[Chuẩn hóa]** trong tài liệu này.
2. Pattern **[Quan sát]** trên `/home`.
3. Primitive hiện có trong `frontend/components/ui/` về hành vi và accessibility.
4. Không lấy giao diện neutral mặc định của shadcn ở các page cũ làm nguồn phong cách.

---

## 1. Giới thiệu

### 1.1. Mục tiêu

Design System này biến ngôn ngữ thiết kế của Home Page thành chuẩn chung cho toàn bộ EngFlex. Một AI Agent hoặc Developer chưa từng đọc project phải có thể dùng tài liệu để:

- thiết kế page mới đồng nhất với Home;
- đánh giá page cũ có lệch chuẩn hay không;
- chọn đúng màu, typography, spacing, radius, elevation và component pattern;
- tạo đủ loading, empty, error, responsive và accessibility states;
- phân biệt component đang có với pattern mới chỉ được đặc tả;
- không tự phát minh một phong cách khác.

### 1.2. Source of truth

Home chuẩn là `/home`. Route `/` chỉ redirect tới `/home`.

| Nguồn | Vai trò |
|---|---|
| `frontend/app/home/page.tsx` | Composition, hero, section order, CTA hierarchy |
| `frontend/components/landing/landing-interactions.tsx` | Navigation, hero visual, tabs, motion, keyboard behavior |
| `frontend/components/landing/landing-sections.tsx` | Value strip, bento features, method, final CTA, footer |
| `frontend/app/globals.css`, phần `.landing-*` | Nền, glass, gradient, border, shadow, focus, keyframes |
| `frontend/app/layout.tsx` | Geist, Geist Mono, metadata, ngôn ngữ `vi` |
| `frontend/components/ui/*` | Primitive behavior; chưa phải visual source of truth của Home |
| `frontend/components/product-shell.tsx`, `frontend/app/(product)`, `frontend/app/(study)` | Product shell và route composition đã triển khai |
| `frontend/components/product/*` | Page header, async states và reveal dùng chung cho product pages |

Khi Home thay đổi có chủ đích, tài liệu này phải được audit và cập nhật cùng thay đổi đó.

### 1.3. Snapshot kỹ thuật frontend

| Hạng mục | Hiện trạng |
|---|---|
| Framework | Next.js 16.2.10, App Router |
| UI runtime | React 19.2.4, TypeScript strict |
| Styling | Tailwind CSS 4 theo CSS-first; không có `tailwind.config.*` |
| UI foundation | shadcn 4.13, preset `base-nova`, Base UI, CSS variables |
| Variant/composition | CVA, clsx, tailwind-merge |
| Icon | Lucide React |
| Motion | Motion for React + CSS keyframes/Tailwind animation utilities |
| Font | Geist Sans, Geist Mono qua `next/font` |
| Theme | Neutral light/dark tokens có sẵn; Home dùng dark cinematic shell riêng |
| Responsive | Tailwind breakpoints + media queries riêng + mobile hook 768px |

CSS hiện gồm:

1. Tailwind, `tw-animate-css` và shadcn imports.
2. Semantic neutral tokens cho light/dark.
3. Base layer.
4. Namespace `.landing-*` cho Home.
5. Nhiều utility và arbitrary value trực tiếp trong JSX.

Không có CSS Module, Sass hay styled-components.

### 1.4. Cấu trúc frontend

| Thư mục | Trách nhiệm |
|---|---|
| `app/` | Route, root layout, global CSS |
| `app/(product)/` | Product routes dùng shared shell; route group không đổi URL |
| `app/(study)/` | Study workspace dùng shared shell với sidebar mặc định đóng |
| `components/landing/` | Toàn bộ visual language đặc thù Home |
| `components/product/` | Page composition, async states và controlled reveal cho product app |
| `components/ui/` | shadcn/Base UI primitives |
| `components/topics/` | Data view cho Topics |
| `components/*.tsx` | App shell, auth form, cards, navigation, study dialog |
| `hooks/` | Responsive/mobile behavior |
| `lib/` | Class merge và API client |
| `services/` | Category/Lesson API |
| `types/` | Type contracts |
| `public/` | Owl mascot, content thumbnail, auth images, scaffold SVG |

### 1.5. Anatomy của Home Page

Thứ tự đọc chính thức:

1. Fixed glass navigation.
2. Hero: promise lớn + hai CTA + trust points.
3. Value strip: ba lợi ích tóm tắt.
4. Feature bento grid: Dictation, Shadowing, Pronunciation, Vocabulary.
5. Interactive Experience: Xem → Luyện → Phản hồi.
6. Method: Input → Practice → Recall.
7. Final CTA.
8. Footer.

Flow này đi từ **lời hứa → bằng chứng → trải nghiệm → phương pháp → chuyển đổi**. Page mới không cần sao chép đúng mọi section, nhưng phải giữ logic hierarchy tương tự: định hướng rõ, nội dung chính, bằng chứng/feedback, hành động tiếp theo.

### 1.6. Hiện trạng cần lưu ý

- Home vẫn là nguồn chuẩn trực quan; nhóm product/study pages đã được đồng bộ sang dark cinematic product foundation, còn auth pages là phạm vi legacy riêng.
- Home không dùng `Button` hay `Card` primitive cho CTA/card chính.
- 51 màu hex literal khác nhau xuất hiện trong Home-related source; token implementation đang phân mảnh.
- Các biến `--landing-*` đã được khai báo nhưng chưa được sử dụng bởi `var(...)`.
- Dark token set tồn tại nhưng không có ThemeProvider hoặc class `dark` ở root.
- Product app đã có `ProductShell`, route-aware header, sidebar EngFlex và semantic product tokens; auth/landing legacy vẫn cần được đánh giá riêng khi chỉnh sửa.
- `Select`, `Textarea`, reusable `Tabs`, `AlertDialog`, `ProductPageHeader`, `AsyncContentState` và `ProductReveal` đã tồn tại. Table/DataTable, Checkbox, Radio, Switch và Pagination primitive vẫn là khoảng trống.
- Topics đã có route-level `loading.tsx`, `error.tsx` và `not-found.tsx`; các route product còn lại dùng system state trong page và chưa chuẩn hóa route-level boundary riêng.

Design System này vừa là đặc tả vừa là inventory: chỉ các mục gắn **[Đã triển khai]** mới được xem là API dùng chung hiện hữu; việc một primitive đã có không đồng nghĩa mọi page đã hoàn tất migration.

---

## 2. Design Philosophy

### 2.1. Định danh phong cách

EngFlex là **Dark Cinematic EdTech SaaS** với bốn lớp ảnh hưởng:

- **Cinematic**: nền navy gần đen, ánh sáng cyan/gold, grid phối cảnh, glow, scene/subtitle/waveform.
- **AI learning cockpit**: score, progress, audio waveform, feedback và panel giống một không gian luyện tập tương tác.
- **Controlled glassmorphism**: surface trong mờ, border rất nhẹ, backdrop blur và inset highlight; glass dùng để thể hiện layer, không dùng như trang trí vô nghĩa.
- **Friendly mascot product**: owl cyan/gold tạo cảm giác thân thiện, cân bằng phần công nghệ cao.

Đây không phải Material Design và cũng không phải Apple-style thuần. Home có hierarchy editorial lớn, bento bất đối xứng và không gian nhập vai gần cinematic/gaming cockpit hơn.

### 2.2. Cảm xúc thương hiệu

- Hiện đại, premium, có chiều sâu.
- Trẻ, thân thiện, không quá học thuật.
- Công nghệ cao nhưng không lạnh.
- Tập trung vào hành động nghe, nói, phản hồi và tiến bộ.
- Dành cho người Việt học tiếng Anh qua phim, đặc biệt nhóm digital-native.

### 2.3. Vai trò thị giác

- **Navy** tạo “sân khấu” và giữ trải nghiệm tập trung.
- **Cyan** đại diện cho thương hiệu, âm thanh, active state, info và focus.
- **Gold** đại diện cho động lực, luyện tập, sự chú ý và conversion CTA.
- **Violet** phân loại recall/shadowing/supporting skill.
- **Emerald/mint** đại diện cho thành công và tiến bộ.
- **White/slate** tạo hierarchy nội dung.
- **Mascot** mang cảm xúc; product mockup mang bằng chứng.

### 2.4. Công thức bề mặt

Một composition đúng ngôn ngữ Home thường có:

1. Canvas navy cố định.
2. Một hoặc hai atmospheric light sources rất mờ.
3. Surface glass hoặc dark gradient với border 1px.
4. Inner surface tối hơn outer surface.
5. Một accent theo chức năng.
6. Shadow mềm, sâu; không viền đậm.
7. Nội dung luôn đọc được khi bỏ toàn bộ decoration.

### 2.5. UX philosophy

- Context before control: giải thích người dùng đang làm gì trước khi đưa công cụ.
- Show, do, feedback: xem ngữ cảnh → luyện tập → nhận phản hồi.
- Progressive disclosure: chỉ đưa chi tiết khi người dùng cần.
- One clear next action: mỗi region có một CTA chính.
- Visual feedback must mean progress: waveform, score, bar và badge phải truyền tải trạng thái thật.
- Motion supports orientation: motion giúp hiểu layer/state, không là mục tiêu tự thân.

---

## 3. Design Principles

### 3.1. Cinematic clarity

Decoration tạo bối cảnh nhưng hierarchy phải rõ ngay ở grayscale. Heading, body và CTA không được phụ thuộc vào glow để nổi bật.

### 3.2. Consistency before novelty

Ưu tiên palette, spacing, radius, surface và pattern đã chuẩn hóa. Không thêm màu, shadow hay layout mới chỉ để một page “khác biệt”.

### 3.3. One accent, one meaning

Mỗi accent giữ vai trò:

- cyan = brand/active/info/focus;
- gold = conversion/practice/attention;
- violet = supporting learning mode;
- emerald = success/progress.

Không dùng cùng một màu cho các ý nghĩa mâu thuẫn trong cùng flow.

### 3.4. Hierarchy before density

Dùng khoảng trắng, cỡ chữ và surface nesting để tạo nhóm. Không dồn nhiều border, badge và icon để bù cho hierarchy yếu.

### 3.5. Reusable behavior

Primitive hiện có là nền hành vi và accessibility. Visual spec của tài liệu này là nền phong cách. Component tương lai phải kết hợp cả hai, không hy sinh semantics để giống Home.

### 3.6. Responsive by composition

Không chỉ thu nhỏ desktop. Mobile stack nội dung theo thứ tự đọc, giảm decoration, giữ CTA và bỏ các layer không thiết yếu.

### 3.7. Accessible by default

Keyboard, focus, screen reader, reduced motion, contrast và touch target là tiêu chí hoàn thành, không phải vòng polish cuối.

### 3.8. Honest system states

Loading, empty, error, disabled và success phải là UI thật. Không dùng `console.error`, browser `alert()` hoặc khoảng trống như feedback cho người dùng.

### 3.9. Brand coherence

Tên chuẩn là **EngFlex**. Owl cinematic là mascot chính. Không tự thay bằng generic icon hoặc asset khác phong cách.

### 3.10. Governed evolution

Pattern chưa có trên Home phải mang nhãn **[Suy ra]**, dùng đúng foundation hiện tại và được bổ sung vào tài liệu khi trở thành pattern chính thức.

---

## 4. Color System

### 4.1. Vấn đề hiện tại

**[Quan sát]** Home có ngôn ngữ màu rõ nhưng implementation chưa phải một color system hoàn chỉnh:

- 51 literal hex khác nhau.
- Cyan khai báo `#64E9FF` nhưng giá trị lặp lại nhiều nhất là `#6EE7F2`; focus thường là `#67E8F9`.
- Gold khai báo `#FFD56A` nhưng giá trị lặp lại nhiều nhất là `#F7C76F`.
- Surface có nhiều navy rất gần nhau.
- Error không có pattern trên Home.

Vì vậy, từ thời điểm tài liệu này có hiệu lực, dùng bảng canonical dưới đây cho thiết kế. Các giá trị gần kề trong source cũ là alias/legacy, không phải lý do tạo thêm token.

### 4.2. Canonical palette

| Token thiết kế | Giá trị canonical | Vai trò | Nguồn |
|---|---:|---|---|
| `color.canvas` | `#050B18` | Nền page chính | [Quan sát] |
| `color.canvas.deep` | `#040B16` | Footer/deepest layer | [Quan sát] |
| `color.surface.glass` | `rgba(13, 27, 48, .72)` | Glass surface chung | [Quan sát/Chuẩn hóa] |
| `color.surface.nav.low` | `rgba(7, 19, 33, .45)` | Nav trước scroll | [Quan sát] |
| `color.surface.nav.high` | `rgba(7, 19, 33, .82)` | Nav sau scroll/menu mở | [Quan sát] |
| `color.surface.panel` | `rgba(8, 21, 34, .70)` | Card/showcase panel | [Chuẩn hóa] |
| `color.surface.inner` | `rgba(6, 17, 28, .74)` | Inner demo/control panel | [Chuẩn hóa] |
| `color.brand.cyan` | `#6EE7F2` | Brand, active, info, audio | [Quan sát/Chuẩn hóa] |
| `color.focus` | `#67E8F9` | Focus ring | [Quan sát] |
| `color.action.gold` | `#F7C76F` | Conversion, practice, attention | [Quan sát/Chuẩn hóa] |
| `color.accent.blue` | `#78A8FF` | Chỉ dùng trong gradient/support | [Quan sát] |
| `color.accent.violet` | `#C4B5FD` | Recall/shadowing/supporting mode | [Quan sát qua violet-300] |
| `color.status.info` | alias `#6EE7F2` | Info/active feedback | [Chuẩn hóa] |
| `color.status.warning` | alias `#F7C76F` | Warning/attention | [Suy ra từ gold] |
| `color.status.success` | `#9AF7C5` | Success/progress/positive feedback | [Quan sát/Chuẩn hóa] |
| `color.text.primary` | `#FFFFFF` | Heading và nội dung chính | [Quan sát] |
| `color.text.secondary` | `#CBD5E1` | Body mạnh, slate-300 | [Quan sát] |
| `color.text.muted` | `#94A3B8` | Supporting copy, slate-400 | [Quan sát] |
| `color.text.subtle` | `#64748B` | Metadata không quan trọng, slate-500 | [Quan sát, hạn chế] |
| `color.status.error` | `oklch(0.704 0.191 22.216)` | Error trên dark context; giá trị `.dark --destructive` hiện có | [Suy ra] |

Alias legacy:

- `#64E9FF` là cyan đã khai báo trong `.landing-shell`.
- `#FFD56A` là gold đã khai báo.
- `#4D7CFF` là blue đã khai báo.
- `#67E8F9`, `#84ECFF`, `#98F4FB` chỉ là cyan highlight/gradient.
- `#FFF2B7`, `#FFD25F`, `#FDE68A`, `#FFDA8C` chỉ là gold highlight/gradient.

Không tạo token semantic mới từ các alias này.
Các `color.status.info` và `color.status.warning` là semantic alias của brand cyan/action gold, không phải màu mới.

### 4.3. Text hierarchy

| Cấp | Màu | Dùng cho |
|---|---|---|
| Primary | white / white 90% | Heading, CTA label, critical value |
| Secondary | slate-300 | Body chính |
| Muted | slate-400 | Description, supporting instruction |
| Subtle | slate-500 | Timestamp, metadata phụ |
| Decorative only | white 35–42% | Large decorative word hoặc cue, không dùng cho body nhỏ |

Trên `#050B18`:

- white đạt khoảng 19.67:1;
- slate-300 khoảng 13.25:1;
- slate-400 khoảng 7.67:1;
- slate-500 chỉ khoảng 4.13:1;
- white 42% khoảng 4.03:1;
- white 35% khoảng 3.13:1.

Do đó:

- slate-500 không dùng cho body nhỏ hoặc thông tin cần đọc;
- white 42% chỉ dùng cho text lớn;
- white 35% chỉ dùng cho decoration/cue không thiết yếu;
- khi nghi ngờ, nâng lên slate-400.

### 4.4. Border palette

| Token | Giá trị | Dùng cho |
|---|---:|---|
| `border.subtle` | white 6% | Divider/inner separation |
| `border.default` | white 8–9% | Card/panel |
| `border.strong` | white 10–14% | Interactive/raised surface |
| `border.glass` | cyan-tinted 14–18% | Glass có nhận diện |
| `border.accent` | accent 15–25% | Active/hover/semantic highlight |
| `border.focus` | cyan 100%, 2px | Focus-visible |

### 4.5. Surface recipes

#### Canvas

- Nền `#050B18`.
- Có thể dùng một radial glow mờ; không thay canvas bằng gradient sáng.
- Footer hoặc deepest layer dùng `#040B16`.

#### Glass

- Border 1px cyan-tinted khoảng 18%.
- Nền gradient navy trong mờ.
- Backdrop blur 12–18px.
- Inset highlight white 5–6%.
- Drop shadow theo elevation.

#### Feature surface

- Outer card là dark gradient có tint theo feature.
- Inner demo panel luôn tối hơn outer.
- Mỗi card tối đa một accent chính.

### 4.6. Gradient chuẩn

| Tên | Công thức | Phạm vi |
|---|---|---|
| Hero text | `#E5FBFF → #67E8F9 → #78A8FF → #FFD56A` | Chỉ một cụm display quan trọng |
| Conversion CTA | `#FFF2B7 → #FFD25F → #84ECFF` | Hero/acquisition CTA |
| Progress cyan | cyan/sky hoặc emerald/cyan | Thanh tiến độ |
| Final CTA panel | `#0B2537 → #101B32 → #2B2114` | Large conversion panel |

Không dùng gradient cho body text, form label, table content hoặc tất cả button.

### 4.7. Semantic color rules

- **Info/active/focus:** cyan.
- **Practice/attention/conversion:** gold.
- **Success/progress:** mint/emerald.
- **Supporting skill:** violet.
- **Recording/live:** rose chỉ là trạng thái recording/live; không mặc định coi rose hiện tại là error system.
- **Error:** dùng semantic destructive token với icon/text, không chỉ dùng màu.
- **Warning:** gold/amber chỉ khi nội dung thật sự cảnh báo; không dùng conversion gold cho lỗi nghiêm trọng.

### 4.8. Quy tắc hard-code

- Không thêm literal hex/rgba mới trong feature/page.
- Chỉ dùng canonical palette hoặc semantic token đã được duyệt.
- Không lấy một navy gần giống để “hợp mắt”.
- Nếu chưa có token implementation, ghi nhận là design debt; không tạo thêm alias ad hoc.

---

## 5. Typography

### 5.1. Font family

| Role | Font |
|---|---|
| UI/body/heading | Geist Sans |
| Metric, timestamp, code-like metadata, eyebrow | Geist Mono |

Không dùng font mới nếu không có quyết định thay đổi thương hiệu. Mono không dùng cho paragraph dài.

### 5.2. Weight

| Weight | Vai trò |
|---:|---|
| 400 | Body |
| 500 | Navigation, label, supporting emphasis |
| 600 | Heading, CTA, card title |
| 700 | Micro status label cần nhấn mạnh |
| 650 | Chỉ là optical weight đang có ở landing kicker; không tạo scale riêng |

### 5.3. Official type scale

| Token | Size | Line-height | Weight | Tracking | Dùng cho |
|---|---|---:|---:|---:|---|
| `display.hero` | `clamp(3.2rem, 7.3vw, 7.4rem)` | .91 | 600 | -.065em | Hero marketing duy nhất |
| `heading.page` | 36px mobile, 48px desktop | 1.05–1.12 | 600 | -.045em | H1 của page/major section |
| `heading.section` | 36 / 48 / 60px tại mobile/sm/lg | 1.05–1.12 | 600 | -.045em | Landing section H2 |
| `heading.card` | 24 / 30px | 1.2 | 600 | tight | Feature/card H3 |
| `heading.compact` | 20 / 24px | 1.25 | 600 | tight | Compact card/modal H3 |
| `body.large` | 18px | 32px | 400 | normal | Lead/supporting paragraph |
| `body.default` | 16px | 28px | 400 | normal | Body |
| `body.small` | 14px | 20–24px | 400/500 | normal | Helper/nav/compact UI |
| `caption` | 12px | 18px | 500 | normal | Caption, metadata |
| `eyebrow` | 10–11px | 16px | 600/700 | .18–.22em | Uppercase/mono label |
| `button` | 14px; 16px ở large | 20–24px | 600 | normal | Button |

`heading.page` là **[Chuẩn hóa]** từ section hierarchy của Home cho product pages; product H1 không dùng cỡ hero.

### 5.4. Typography hierarchy

- Mỗi page chỉ có một H1.
- Section chính đi theo H2; card title theo H3.
- Eyebrow đứng trước heading, không thay heading.
- Heading ưu tiên 600, tránh 700 trừ nội dung compact đặc biệt.
- Tracking âm chỉ dùng cho heading lớn.
- Uppercase tracking rộng chỉ dùng cho micro-label.
- Body line length mục tiêu 55–72 ký tự; copy block thường cap 640–672px.
- Không dùng micro text dưới 10px cho thông tin cần đọc.
- Không dùng slate-500 cho text 12–14px quan trọng.
- Nội dung tiếng Việt phải dùng dấu đầy đủ và thống nhất với `lang="vi"`.

### 5.5. Button, label và metric

- Button: 14px semibold; large 16px.
- Form label: 14px medium.
- Metric chính: Geist Sans semibold.
- Metric label/timestamp/step number: Geist Mono 10–12px.
- Không dùng font mono để tạo cảm giác “tech” cho mọi nội dung.

---

## 6. Spacing

### 6.1. Base unit

Base unit là 4px. Dùng scale chính:

| Token | px | Công dụng phổ biến |
|---|---:|---|
| `space-1` | 4 | Icon micro, optical separation |
| `space-2` | 8 | Gap compact |
| `space-3` | 12 | Control/card row gap |
| `space-4` | 16 | Standard component padding |
| `space-5` | 20 | Mobile gutter, field group |
| `space-6` | 24 | Card padding mobile |
| `space-8` | 32 | Card padding desktop, major gap |
| `space-10` | 40 | Desktop page gutter |
| `space-12` | 48 | Wide gutter/section internal |
| `space-16` | 64 | Major block separation |
| `space-20` | 80 | Compact section vertical |
| `space-24` | 96 | Standard immersive section |
| `space-28` | 112 | Marketing section |
| `space-36` | 144 | Large desktop/sm section |

Giá trị 6, 10, 14 và 28px trong source chỉ dùng cho compact control hoặc optical adjustment. Không xây page rhythm từ các giá trị lẻ.

### 6.2. Page gutters

| Viewport | Gutter |
|---|---:|
| Mobile | 20px |
| `sm` | 32px |
| Desktop chuẩn | 40px |
| Hero/Experience desktop | 48px |

Không dùng `p-5` ở một page và `p-6` ở page khác mà không có lý do layout.

### 6.3. Section rhythm

- Compact/product section: 64–80px vertical.
- Standard content section: 80–96px.
- Marketing feature/method: 112px mobile, 144px từ `sm`/desktop như Home.
- Heading → paragraph: 24px.
- Paragraph → actions: 32px.
- Eyebrow → heading: 16–20px.
- Card grid gap: 16px mobile, 20px desktop.

### 6.4. Component spacing

- Card outer padding: 24px mobile, 32px từ `sm`.
- Inner panel padding: 16–24px.
- Form group gap: 20px.
- Field internal gap: 8px.
- Button icon gap: 8px.
- Navigation item gap: 4–8px.
- Modal content gap: 16–24px.

### 6.5. Spacing rules

- Spacing thể hiện quan hệ: gần = cùng nhóm, xa = nhóm khác.
- Không dùng margin âm để sửa hierarchy; Home chỉ dùng negative margin có chủ đích cho hero visual ở wide viewport.
- Không đặt padding khác nhau trên các card cùng cấp.
- Không hard-code pixel mới nếu scale đã có giá trị tương đương.
- Mobile không giảm mọi khoảng cách về mức compact; giữ đủ breathing room và touch target.

---

## 7. Border

### 7.1. Border width

- Default surface/card/divider: 1px.
- Focus-visible: 2px.
- Không dùng border 2px cho card thông thường.
- Không chồng ring và border đậm chỉ để tăng độ nổi; dùng elevation đúng cấp.

### 7.2. Border recipes

| Recipe | Màu/opacity | Dùng cho |
|---|---|---|
| Subtle divider | white 6–7% | Chia row/inner panel |
| Standard surface | white 8–9% | Card/panel |
| Raised surface | white 10–14% | Interactive/floating panel |
| Glass | cyan-tinted 14–18% | Nav/eyebrow/glass |
| Accent state | accent 15–25% | Hover/active/semantic state |
| Focus | `#67E8F9` 100%, 2px, offset 4px | Keyboard focus |

### 7.3. Divider

- Divider nằm trong cùng surface dùng white 6–8%.
- Divider full-width chỉ dùng khi thật sự chia nhóm.
- Ưu tiên spacing trước divider.
- Gradient divider cyan rất mờ chỉ dùng cho section/cinematic composition, không dùng trong table/form hàng ngày.

### 7.4. Border state

- Hover: tăng tint/opacity nhẹ, không nhảy từ 8% lên 100%.
- Active/selected: accent 20–25% + background tint nhỏ.
- Disabled: border vẫn thấy được nhưng toàn control giảm opacity.
- Error: destructive border + icon/text; không chỉ đổi border.

---

## 8. Radius

### 8.1. Hiện trạng

Global neutral radius base hiện là 10px, trong khi Home chủ yếu dùng 12–40px và pill. Home còn có các arbitrary radius 23.2px, 24.8px. Các giá trị lẻ này là implementation detail, không phải scale mới.

### 8.2. Official radius scale

| Token | Giá trị | Dùng cho |
|---|---:|---|
| `radius.control` | 12px | Button nhỏ, input, row, chip container |
| `radius.nav` | 16px | Nav, icon tile, standard controls |
| `radius.panel` | 24px | Inner demo, modal mobile, media panel |
| `radius.card` | 28px | Standard content/method/value card |
| `radius.feature` | 32px | Bento feature card/showcase |
| `radius.cta` | 36px | Large conversion panel |
| `radius.showcase` | 40px | Hero/experience outer glass từ `sm` |
| `radius.full` | 9999px | Pill/circle/avatar/progress |

### 8.3. Radius hierarchy

- Surface càng lớn/càng cao thì radius có thể lớn hơn.
- Inner panel luôn có radius nhỏ hơn outer panel.
- Button CTA dạng pill; nav/control compact dùng 12–16px.
- Card cùng cấp phải cùng radius.
- Không trộn 10px neutral shadcn card với 32px cinematic card trong cùng page.

---

## 9. Shadow

### 9.1. Elevation model

| Level | Recipe chuẩn | Dùng cho |
|---|---|---|
| `elevation-0` | Không drop shadow; có thể inset top white 5% | Flat/inner surface |
| `elevation-1` | `0 12px 32px rgba(0,0,0,.25)` | Icon tile, floating compact control |
| `elevation-2` | `0 28px 80px rgba(0,0,0,.22)` + inset top | Standard card |
| `elevation-3` | `0 34px 100px rgba(0,0,0,.34)` + inset top | Experience/modal/showcase |
| `elevation-4` | `0 45px 120px rgba(0,0,0,.55)` + optional accent glow | Hero/cinematic focal |

Home còn dùng CTA shadow đến khoảng `0 45px 140px rgba(0,0,0,.38)`; đây là biến thể của `elevation-4`.

### 9.2. Inset highlight

- Dùng `inset 0 1px rgba(255,255,255,.05–.09)` để mô tả cạnh glass.
- Inset highlight không thay border.
- Không dùng inset highlight trên canvas hoặc mọi row trong table.

### 9.3. Accent glow

- Cyan glow cho focus/audio/active.
- Gold glow cho CTA/practice.
- Emerald glow cho status success.
- Glow có opacity thấp, blur lớn; không làm halo bão hòa.
- Mỗi composition chỉ nên có một glow chủ đạo.

### 9.4. Hover elevation

- Interactive card có thể nâng tối đa 4px.
- CTA nâng tối đa 2px.
- Static card không có hover lift.
- Active/pressed đưa control trở lại gần mặt phẳng, phù hợp primitive hiện có `translateY(1px)`.
- Tất cả transform phải bị tắt/giảm khi reduced motion.

---

## 10. Layout

### 10.1. Container system

| Container | Max width | Dùng cho |
|---|---:|---|
| Standard | 1280px | Nav, section, footer, product content rộng |
| Showcase | 1320px | Experience hoặc data-rich focal section |
| Hero wide | 1440px | Hero đặc biệt |
| Prose | 640–672px | Paragraph/section copy |
| Hero copy | 768px | Marketing headline/copy |
| Hero visual | 680px | Product demo illustration |

Ultra-wide không mở rộng nội dung vô hạn. Sau max width, tăng outer whitespace.

### 10.2. Page shell

Page chuẩn:

1. Canvas `#050B18`.
2. Navigation/shell nhất quán.
3. Main content nằm trong container.
4. Page heading có H1, description và actions rõ.
5. Content chia thành section/card theo spacing scale.
6. Loading/empty/error giữ cùng footprint với content.

Product page không dùng hero display trừ khi thật sự là marketing/intro page.

`ProductShell` **[Đã triển khai]** là shell duy nhất cho product và study routes:

- route group `app/(product)` chứa các page sản phẩm; `app/(study)` chứa workspace học, không route group nào làm thay đổi URL công khai;
- mỗi group layout đọc `await cookies()` và truyền `defaultSidebarOpen` vào `ProductShell`;
- nếu chưa có cookie, product mặc định mở sidebar và study mặc định đóng sidebar; nếu có `sidebar_state`, cookie luôn thắng default của group để giữ lựa chọn qua navigation;
- shell chỉ render một skip link, một `main#main-content`, một `SiteHeader` và một `AppSidebar`; route con không được lồng thêm shell, skip link hoặc `main-content` thứ hai;
- sidebar rộng 18rem và header cao 4rem thông qua custom properties của shell;
- route layout con chỉ giữ metadata hoặc composition riêng của page.

### 10.3. Grid

Pattern Home được phép tái sử dụng:

| Pattern | Mobile | Desktop |
|---|---|---|
| Hero | 1 cột | `0.92fr / 1.08fr` tại `lg` |
| Section intro | 1 cột | `0.8fr / 1.2fr` |
| Feature bento | 1 cột | 12 cột; 7/5 rồi 5/7 |
| Experience | 1 cột | `1.35fr / .65fr` |
| Final CTA | 1 cột | `1.15fr / .85fr` |
| Method | 1 cột | 3 cột bằng nhau |
| Value strip | 1 cột | 3 cột từ `md` |

Với product grids:

- mobile: 1 cột;
- tablet: 2 cột khi card đủ rộng;
- desktop: 3–4 cột tùy nội dung;
- không nhảy trực tiếp từ 1 cột sang 4 cột nếu tablet cần 2 cột;
- card width ưu tiên khả năng đọc, không chỉ lấp đầy hàng.

### 10.4. Header

Landing header:

- fixed, `z-50`;
- outer gutter 16px mobile, 24px từ `sm`;
- inner height 64px;
- max width 1280px;
- glass state thay đổi sau scroll 24px;
- desktop nav từ `lg`.

Product header **[Chuẩn hóa]**:

- cao 64px để đồng bộ nhịp Home;
- cùng navy/glass/border language;
- title/breadcrumb bên trái, page action bên phải;
- không hard-code title không liên quan tới route;
- giữ trong app shell, không tạo header riêng cho từng page.

`SiteHeader` **[Đã triển khai]** resolve `ProductRouteDescriptor` từ pathname. Descriptor là nguồn duy nhất cho title, breadcrumb và contextual action của route; page content vẫn dùng một H1 riêng qua `ProductPageHeader`.

### 10.5. Sidebar

**[Quan sát]** Infrastructure hiện dùng:

- 288px trong shared `ProductShell`;
- mobile Sheet dưới 768px;
- offcanvas/cookie state/keyboard shortcut;
- icon-collapsed primitive 48px.

**[Chuẩn hóa]** visual target:

- background deep navy/surface, không dùng zinc sáng;
- border right white 6–8%;
- active item: cyan tint nhẹ, text white, icon cyan;
- hover: white 4–6%;
- primary sidebar CTA: gold khi thật sự cần;
- user/footer region tách bằng divider subtle;
- mobile dùng Sheet và giữ đầy đủ accessible name/focus behavior.
- `sidebar_state` lưu lựa chọn người dùng; group default chỉ áp dụng khi cookie chưa tồn tại.

### 10.6. Footer

- Background `#040B16`.
- Border top white 7%.
- Max width 1280px.
- Stack trên mobile; row từ `md`.
- Link dùng slate-400, hover/focus cyan.
- Status success dùng emerald; không lạm dụng status dot trang trí.

### 10.7. Section composition

- Có một visual anchor, không nhiều focal point cạnh tranh.
- Heading group thường cap 768px; prose cap 672px.
- Bento chỉ dùng khi card có nội dung/hành vi khác nhau.
- Section đơn giản không cần glow/orbit/grid.
- Nội dung quan trọng ở DOM order trước decoration.

---

## 11. Responsive

### 11.1. Breakpoint foundation

| Breakpoint | Giá trị | Ý nghĩa |
|---|---:|---|
| base | <640px | Mobile |
| `sm` | ≥640px | Large mobile/small tablet |
| `md` | ≥768px | Tablet; app sidebar chuyển desktop |
| `lg` | ≥1024px | Desktop composition |
| `xl` | ≥1280px | Wide desktop decoration |
| `2xl` | ≥1536px | Ultra-wide; không kéo giãn container |

Custom CSS Home còn dùng max-width 1023px và 640px. Mobile hook dùng dưới 768px.

### 11.2. Responsive philosophy

- Mobile-first.
- Stack theo reading order, không chỉ theo thứ tự visual desktop.
- Decoration ẩn trước, nội dung/CTA giữ lại.
- Gutter tăng 20 → 32 → 40/48px.
- Multi-column chỉ bật khi mỗi cột còn đủ width.
- Heading scale responsive; body không nhỏ đi dưới chuẩn.
- Ultra-wide tăng whitespace, không tăng line length.

### 11.3. Responsive media

- Dùng `next/image` và khai báo `sizes` đúng layout.
- Mascot giữ 1:1, không méo.
- Content thumbnail giữ aspect 16:9.
- Floating metrics/ornament có thể ẩn dưới `sm`.
- Không ẩn thông tin chức năng chỉ vì thiếu chỗ; thay layout hoặc disclosure.

### 11.4. Responsive interaction

- Touch không chạy pointer parallax/tilt.
- Không dùng hover là con đường duy nhất để xem nội dung.
- Mobile menu/Sheet phải đóng bằng Escape, close button và chọn item.
- Touch target tối thiểu 44×44px, ưu tiên 48px.

Chi tiết hành vi theo từng breakpoint nằm ở mục 24.

---

## 12. Icon Guideline

### 12.1. Library

Chỉ dùng **Lucide React** cho icon UI. Không trộn icon pack khác, emoji hoặc SVG ngẫu nhiên trong cùng hệ thống.

### 12.2. Size scale

| Kích thước | Dùng cho |
|---:|---|
| 14px | Micro label/compact status |
| 16px | Button, nav, field, standard UI |
| 18px | Sidebar nav hiện tại |
| 20px | Card action/icon tile |
| 24px | Large feature/empty state |
| 28–32px | Hero recording/special focal only |

Icon-only button có glyph 16–20px nhưng hit area 44–48px.

### 12.3. Stroke và màu

- Giữ stroke weight mặc định Lucide.
- Icon mặc định inherit text color.
- Cyan = active/info/audio.
- Gold = practice/CTA/attention.
- Violet = supporting mode.
- Emerald = success.
- Không dùng nhiều màu trong một icon trừ brand illustration.

### 12.4. Semantics

- Icon trang trí: `aria-hidden="true"`.
- Icon-only control: có accessible name rõ.
- Icon không thay label cho action quan trọng nếu nghĩa không phổ quát.
- Không dùng màu icon là tín hiệu duy nhất.
- Arrow/chevron chỉ hướng; không dùng làm decoration vô nghĩa.

### 12.5. Brand mark

Brand lockup chuẩn ở Home là owl cinematic + chữ **EngFlex**, cyan nhấn “Flex”. Clapperboard ở footer là secondary contextual mark, không thay mascot trong toàn app. Không dùng Command icon hoặc Gallery icon làm logo EngFlex.

---

## 13. Illustration Guideline

### 13.1. Asset chuẩn

| Asset | Vai trò |
|---|---|
| `frontend/public/owl-speaking-cinematic.webp` | Nav, hero, speaking/listening context |
| `frontend/public/owl-writing-cinematic.webp` | Writing/vocabulary/final CTA |
| `frontend/public/owl-speaking-light.webp` | Chỉ cho surface light có chủ đích |

Hai cinematic assets là illustration vuông 1024×1024, nền navy, owl cyan và headphone gold; đây là phong cách nhận diện chính.

### 13.2. Usage

- Giữ aspect ratio 1:1.
- Dùng `object-contain` khi mascot là layer nổi.
- Dùng `object-cover` chỉ khi asset nằm trong frame có crop chủ đích.
- Nav mark khoảng 40px.
- Hero visual có thể đến khoảng 290px theo `sizes`.
- CTA illustration cap khoảng 368px.
- Chỉ một mascot focal trong một section.

### 13.3. Dark và light variants

- Dark cinematic asset trên navy/glass.
- Light asset chỉ trên nền sáng được thiết kế riêng.
- Không đặt PNG/light asset có nền trắng vào dark card nếu tạo khối trắng lạc tông.
- Không trộn stock photo tông ấm với owl cinematic trong cùng page nếu chưa có art direction nối hai phong cách.

### 13.4. Alt text

- Illustration mang nội dung: alt mô tả ngắn mục đích/hành động.
- Illustration hoàn toàn trang trí và parent đã có accessible label: alt rỗng + `aria-hidden` khi phù hợp.
- Không dùng alt chung chung như “Image”.
- Product thumbnail mô tả tên bài học/phim, không mô tả màu sắc thừa.

### 13.5. Atmospheric illustration

Aurora, noise, grid, orbit và glow:

- luôn `aria-hidden` và không nhận pointer event;
- opacity thấp;
- không làm giảm contrast;
- mobile giảm blur/density và có thể ẩn;
- không copy tất cả atmospheric layers sang mọi page;
- product page thường chỉ cần một glow rất mờ hoặc không cần.

### 13.6. Không được làm

- Không tự tạo mascot style khác.
- Không kéo méo asset.
- Không đặt text quan trọng lên vùng mascot bận.
- Không dùng illustration để thay empty/error copy.
- Không thêm animation mới vào illustration ngoài motion inventory đã có.

---

## 14. Button Guideline

### 14.1. Trạng thái implementation

**[Quan sát]**

- Home CTA là custom `Link` cao 48–56px.
- Primitive `Button` hiện có variant default/outline/secondary/ghost/destructive/link, nhưng height chỉ 24–36px.
- Primitive có focus, active, disabled và invalid behavior.
- Home chưa có button loading state.

**[Khoảng trống]** Không được coi default `Button` 32px là đã đạt visual/touch spec EngFlex.

### 14.2. Variants chính thức

| Variant | Visual | Dùng khi |
|---|---|---|
| Brand conversion | Gold→cyan gradient, dark text, pill | Hero/acquisition CTA; tối đa một CTA chính trong region |
| Primary product | Solid cyan, slate-950 text, pill hoặc 16px | Hành động chính trong product/section |
| Secondary glass | Navy glass, border cyan-tinted, white text | Hành động phụ |
| Ghost | Transparent, subtle hover surface | Nav, toolbar, back action |
| Destructive | Destructive tint + destructive text/icon | Hành động nguy hiểm; [Suy ra] |
| Link | Cyan/text color, underline on hover/focus khi phù hợp | Tertiary action |
| Icon | Ghost/glass square hit area | Menu, close, media control |

Không đặt hai button Brand conversion cạnh nhau. Trong một action group, chỉ một button có độ ưu tiên cao nhất.

### 14.3. Size

| Size | Height | Horizontal padding | Text | Radius | Icon |
|---|---:|---:|---:|---:|---:|
| Small/nav | 40px | 16px | 14px/600 | 12px | 16px |
| Medium/default app | 48px | 24px | 14px/600 | 16px hoặc pill | 16px |
| Large/hero | 56px | 28px | 16px/600 | pill | 16–20px |
| Icon compact | min 44×44px | — | — | 12–16px | 16–20px |

Home mobile menu button hiện 40px; đây là **[Khoảng trống accessibility]**. Thiết kế mới dùng hit area tối thiểu 44px.

### 14.4. States

#### Default

- Label rõ, không phụ thuộc icon.
- Icon gap 8px.
- Width theo nội dung; full-width trên mobile form khi hợp lý.

#### Hover

- Chỉ áp dụng khi thiết bị hỗ trợ hover.
- CTA nâng tối đa 2px.
- Primary tăng brightness/glow nhẹ.
- Secondary tăng border cyan và surface opacity nhẹ.
- Arrow có thể dịch 4px như Home.

#### Active/pressed

- Bỏ hover lift hoặc dịch xuống 1px.
- Không scale nhỏ mạnh.
- Giữ contrast và label ổn định.
- Dùng hành vi primitive hiện có làm baseline.

#### Focus-visible

- Outline/ring cyan 2px.
- Offset 4px trên dark canvas.
- Không bỏ outline nếu không có replacement tương đương.

#### Disabled

- Không nhận pointer event.
- Opacity khoảng 50%.
- Không hover/lift/glow.
- Vẫn phải đọc được label; không chỉ đổi màu.

#### Loading

**[Suy ra]** vì Home và primitive chưa có loading button:

- Giữ nguyên width/height để layout không giật.
- Set disabled và `aria-busy="true"`.
- Label chuyển thành hành động đang diễn ra, ví dụ “Đang lưu…”.
- Không tự thêm spinner animation mới. Chỉ dùng indicator đã được hệ thống phê duyệt; nếu chưa có, dùng label trạng thái tĩnh.
- Không thay button bằng skeleton.

### 14.5. Icon rules

- Leading icon cho object/action; trailing arrow cho navigation/continue.
- Không đặt cả leading và trailing icon nếu không cần.
- Decorative icon `aria-hidden`.
- Icon-only có accessible label.
- Không dùng mascot làm button icon.

### 14.6. CTA copy

- Dùng động từ cụ thể: “Bắt đầu học”, “Khám phá bài học”, “Thử lại”.
- Tránh “OK”, “Submit”, “Click here”.
- CTA chính mô tả kết quả, không mô tả cơ chế.
- Ngôn ngữ thống nhất tiếng Việt trong cùng flow.

### 14.7. Badge và status chip

- Badge là thông tin compact, không phải CTA.
- Height mục tiêu 24–28px; horizontal padding 8–12px; radius full.
- Text 10–12px, medium/semibold; Geist Mono cho status/metric ngắn.
- Neutral dùng white 5–8% + slate-300.
- Info dùng cyan tint; success emerald; attention gold; supporting mode violet.
- Destructive badge dùng destructive semantic token, không dùng rose recording tùy tiện.
- Badge tương tác phải là link/button với focus state; badge thuần thông tin không có hover.
- Không đặt quá ba badge cạnh nhau trên lesson card.
- Không viết paragraph hoặc câu dài trong badge.

---

## 15. Form Guideline

### 15.1. Trạng thái implementation

**[Quan sát]** Home không có form. Source hiện có:

- `Input` cao 32px;
- `Label`;
- `Field`, `FieldDescription`, `FieldError role="alert"`;
- `Textarea` product-styled với label bên ngoài, invalid/focus/disabled states;
- `Select` dựa trên Base UI với portal, popup, item selection và keyboard behavior;
- login/signup form dựa chủ yếu vào native `required`.

**[Đã triển khai]** `Select` và `Textarea` đã có trong `components/ui/`. Checkbox, Radio, Switch và một form-level submit state API thống nhất vẫn là **[Khoảng trống]**. Các quy tắc chưa có component bên dưới vẫn là **[Suy ra]** từ visual language Home và behavior primitive hiện có.

### 15.2. Field anatomy

Thứ tự:

1. Label.
2. Optional indicator hoặc required indicator có text/accessible name.
3. Control.
4. Description/helper nếu cần.
5. Validation/error.

Spacing:

- label → control: 8px;
- control → helper/error: 8px;
- field → field: 20px;
- form section → action: 24–32px.

Placeholder không thay label.

### 15.3. Input

| Thuộc tính | Chuẩn |
|---|---|
| Height | 48px |
| Radius | 12px |
| Padding | 16px horizontal |
| Background | white 4–6% trên navy |
| Border | white 10% |
| Text | white/slate-200, 14–16px |
| Placeholder | slate-500; không chứa thông tin bắt buộc |
| Focus | cyan 2px, offset/ring rõ |
| Disabled | opacity 50%, no pointer, vẫn đọc được |
| Invalid | destructive border/ring + error message |

Input có icon:

- icon 16px;
- padding không chèn lên text;
- password visibility là button có accessible label;
- prefix/suffix không làm control thấp hơn 48px.

### 15.4. Select

**[Đã triển khai]** bằng Base UI; giữ behavior focus, selection, portal và typeahead của primitive.

- Trigger có target tối thiểu 44px, cùng radius và dark inner surface với product controls.
- Chevron 16px ở trailing edge.
- Menu dùng dark glass/popover, radius 12–16px, border white 8–10%, elevation 2.
- Selected item có cyan tint và check icon.
- Hỗ trợ keyboard, typeahead, focus management; không dựng select bằng clickable div.
- Placeholder của Select không thay label.

### 15.5. Textarea

**[Đã triển khai]** bằng native `textarea` với product token và semantic invalid state.

- Min-height mặc định 96px; consumer có thể tăng theo workflow nhưng không giảm dưới touch/readability target.
- Padding 16px.
- Radius 12px.
- Cùng border/focus/error state với Input.
- Native resize không được làm vỡ layout ngang; page có thể giới hạn theo workflow.
- Với giới hạn ký tự, counter dùng caption/mono và có accessible description.

### 15.6. Checkbox

**[Suy ra/Chưa có component]**

- Visual box 20×20px; hit area tối thiểu 44px qua label row.
- Radius 6px.
- Selected: cyan fill, dark check.
- Indeterminate: cyan fill, minus glyph.
- Label 14–16px; toàn row clickable.
- Error đặt ở group, không lặp dưới từng item.

### 15.7. Radio

**[Suy ra/Chưa có component]**

- Visual 20×20px; hit area tối thiểu 44px.
- Selected ring cyan + center dot.
- Group dùng `fieldset/legend`.
- Arrow key behavior theo radio group native/Base UI.
- Không dùng card click-only thay radio semantics.

### 15.8. Switch

**[Suy ra/Chưa có component]**

- Track khoảng 40×24px, thumb 20px.
- Off: white 10–14%; on: cyan.
- Label mô tả trạng thái/hành vi, không chỉ “On/Off”.
- Không dùng switch cho action cần xác nhận tức thì.

### 15.9. Validation

- Validation inline gần field.
- `aria-invalid="true"` khi lỗi.
- `aria-describedby` nối helper/error.
- Error text có `role="alert"` khi xuất hiện sau submit.
- Không chỉ dùng màu; có icon hoặc copy rõ.
- Không xóa dữ liệu người dùng khi lỗi.
- Focus field lỗi đầu tiên sau submit khi phù hợp.
- Server error cấp form đặt ở đầu form với retry/context.
- Success message xác nhận kết quả và next action.

### 15.10. Form UX

- Button submit disabled/loading trong khi request.
- Không hiển thị empty state trong lúc dữ liệu đang load.
- Password phải có guidance rõ, không chỉ mô tả tĩnh sau lỗi.
- Confirm password phải kiểm tra matching.
- Error copy hướng dẫn cách sửa.
- Form mobile ưu tiên single column.
- Không dùng browser alert làm success/error feedback.

---

## 16. Card Guideline

### 16.1. Trạng thái implementation

- Primitive `Card` hiện là neutral surface, radius khoảng 12–14px.
- Home tự dựng card/article radius 28–32px với dark gradient/glass.
- `CategoryCard` và `LessonCard` hiện chưa theo Home language.

Visual source of truth là Home card, nhưng semantic slots của primitive vẫn là behavior/composition tham khảo.

### 16.2. Card tiers

| Tier | Radius | Padding | Elevation | Dùng cho |
|---|---:|---:|---|---|
| Utility | 12–16px | 12–16px | 0–1 | Metric row, chip group, compact item |
| Content | 24–28px | 24px | 1–2 | Lesson/category/method |
| Feature | 32px | 24/32px | 2 | Bento feature |
| Showcase | 32/40px | Outer 8–16px + inner panels | 3–4 | Hero/Experience |

### 16.3. Surface

- Dark translucent/gradient outer surface.
- Border white 8–9%.
- Inset top white 5–6%.
- Inner panel tối hơn outer.
- Accent tint theo feature nhưng không đổi toàn bộ palette.
- Không dùng white card trên cinematic canvas trừ light theme được thiết kế riêng.

### 16.4. Card anatomy

#### Header

- Eyebrow/feature label.
- Heading semantic H2/H3 tùy outline.
- Description.
- Optional action ở góc phải.

#### Content

- Nội dung chính hoặc product demonstration.
- Spacing nhất quán.
- Không lồng quá hai cấp card.

#### Footer

- Optional divider white 6–7%.
- Status, metadata hoặc actions.
- Primary action ở cuối reading order.

#### Action

- Icon-only action có tooltip/label.
- Menu action không che heading.
- Không biến toàn card thành clickable nếu bên trong có nhiều interactive child.

### 16.5. Hover/selected/disabled

- Static card: không hover lift.
- Interactive card: hover nâng 4px, border accent 20–25%, media zoom nhẹ nếu có.
- Focus-visible tương đương hover và rõ hơn bằng cyan ring.
- Selected: cyan tint + `aria-selected` hoặc semantics phù hợp.
- Disabled: opacity giảm, không hover/click.
- Loading: skeleton theo đúng card anatomy.

### 16.6. Interactive semantics

- Navigation card dùng link.
- Action card dùng button.
- Không dùng `div onClick` nếu không có keyboard/focus semantics.
- Hover-only reveal phải có tap/keyboard path.
- Card title phải là heading thật khi đóng vai trò heading.

### 16.7. Lesson/content card

- Thumbnail 16:9.
- Badge level/status tối đa 2–3, không lấp ảnh.
- Title tối đa 2 dòng.
- Metadata dùng caption/mono khi phù hợp.
- Card grid chuyển 1 → 2 → 3/4 cột theo breakpoint.
- Không đặt `max-w` khiến grid xuất hiện khoảng trống không chủ đích.

---

## 17. Table Guideline

### 17.1. Trạng thái

**[Khoảng trống]** Không có Table/DataTable component hoặc table usage trong frontend, dù TanStack Table có trong dependency. Phần này là **[Suy ra]**; không được nói với Agent rằng Table đã tồn tại.

### 17.2. Visual recipe

- Outer container: dark glass, radius 24px, border white 8–9%, elevation 1–2.
- Header row: surface inner, mono/uppercase caption 10–12px, slate-400.
- Body: 14px slate-200/300.
- Row divider: white 6%.
- Row hover: white 3–5%, không nâng hoặc shadow từng row.
- Selected row: cyan tint 5–8% + accessible selected state.
- Numeric/metric column: Geist Mono, tabular number.
- Status dùng semantic badge; không tô cả row nếu không cần.

### 17.3. Sizing

- Row height 52–64px.
- Cell horizontal padding 16–20px.
- Header có thể sticky trong scroll container.
- Action column vừa nội dung, đặt cuối.
- Text column có min width hợp lý và truncate kèm cách xem đầy đủ.

### 17.4. Behavior

- Dùng semantic `table`, `thead`, `tbody`, `th`, `td`.
- Sort control là button trong header, có `aria-sort`.
- Selection có label rõ và keyboard support.
- Pagination/filter giữ trạng thái khi loading/error nếu có thể.
- Empty/loading/error render trong table region, không làm mất header/context.

### 17.5. Responsive

Ưu tiên theo thứ tự:

1. Cho phép horizontal scroll với label/cột chính sticky.
2. Ẩn cột phụ có chủ đích.
3. Chuyển sang card list nếu nhiệm vụ mobile khác hẳn table.

Không bóp mọi cột tới mức không đọc được. Không dùng font 10px để giữ table vừa màn hình.

---

## 18. Modal Guideline

### 18.1. Trạng thái implementation

- Base UI `Dialog` primitive hiện có portal, overlay, focus behavior, close, title/description/footer slots và transition.
- Base UI `AlertDialog` product-styled **[Đã triển khai]** cho destructive/irreversible confirmation.
- Home không có modal.

Visual dưới đây là **[Suy ra]** từ Home; behavior phải giữ từ Base UI.

### 18.2. Modal sizes

| Size | Max width | Dùng cho |
|---|---:|---|
| Small | 400px | Confirm/simple form |
| Medium | 560px | Standard workflow |
| Large | 720px | Study mode/multi-option |

- Mobile width: `calc(100% - 32px)`.
- Max-height khoảng 90svh; content dài scroll bên trong.
- Mobile complex workflow có thể dùng Sheet/full-height pattern thay modal quá cao.

### 18.3. Visual

- Overlay: black khoảng 45–55%, backdrop blur nhẹ.
- Content: near-opaque dark panel, border white 9%.
- Radius: 24px mobile, 32px desktop.
- Padding: 24px mobile, 32px desktop.
- Elevation 3.
- Close control hit area tối thiểu 44px.

### 18.4. Anatomy

1. `DialogTitle` semantic.
2. `DialogDescription` nếu cần.
3. Body/content.
4. Validation/status.
5. Footer actions.
6. Close button.

Footer:

- mobile stack reverse nếu primary cần gần thumb;
- desktop actions align end;
- secondary trước primary theo reading order;
- destructive action tách rõ.

### 18.5. Interaction

- Focus trap.
- Escape đóng trừ destructive/critical flow có lý do rõ.
- Restore focus về trigger.
- Không auto-focus destructive action.
- Option card trong modal phải là button/radio, không là clickable div.
- Loading giữ modal mở và giữ context.
- Error hiển thị trong modal; không đóng modal âm thầm.

### 18.6. Motion

- Chỉ dùng fade/zoom 95% trong dải state transition 0.25–0.45s; `AlertDialog` hiện dùng 0.3s.
- Không thêm bounce/3D/aurora animation vào modal.
- Reduced motion bỏ transform và rút duration.

### 18.7. Sheet/Drawer

- Primitive `Sheet` hiện có bốn hướng và đang phục vụ mobile sidebar.
- Dùng Sheet cho navigation, filter hoặc workflow dài cần giữ context; không dùng thay modal confirm nhỏ.
- Mobile side sheet có thể rộng 75–90vw, cap khoảng 384px khi phù hợp.
- Surface deep navy, border white 8%, elevation 3.
- Header có title/description semantic; close target tối thiểu 44px.
- Footer action sticky chỉ khi content scroll dài.
- Focus trap, Escape và restore focus theo behavior Dialog.
- Reduced motion bỏ slide distance, giữ transition tối thiểu.

### 18.8. AlertDialog/ConfirmDialog

`AlertDialog` **[Đã triển khai]** trong `components/ui/alert-dialog.tsx` và là primitive bắt buộc cho xóa hoặc hành động khó hoàn tác:

- dùng Base UI `Root`, `Trigger`, `Backdrop`, `Popup`, `Title`, `Description` và `Close` để giữ focus management, Escape và restore focus;
- confirmation gồm title mô tả hành động, description nêu hậu quả, cancel rõ ràng và action có pending/disabled feedback;
- không thay bằng browser `confirm()`/`alert()` hoặc Dialog chung thiếu semantics cảnh báo;
- action destructive không được auto-focus; khi request lỗi, giữ dialog/context và hiển thị feedback inline;
- overlay/content dùng product tokens; reduced motion tắt zoom/transform và đưa duration về 0.

---

## 19. Navigation Guideline

### 19.1. Landing navigation

Pattern chuẩn từ Home:

- fixed glass nav;
- height 64px;
- max width 1280px;
- logo owl + EngFlex;
- links desktop từ `lg`;
- CTA từ `sm`;
- hamburger dưới `lg`;
- scroll state sau 24px;
- focus cyan;
- mobile menu có `aria-expanded`, `aria-controls` và Escape close.

Thêm `aria-current` cho link hiện hành khi áp dụng cho multi-page nav.

### 19.2. Product sidebar

Behavior **[Đã triển khai]** được giữ:

- Sheet dưới 768px;
- expanded/collapsed state;
- keyboard shortcut;
- tooltip khi collapsed.
- state được lưu trong cookie `sidebar_state` và được server layout đọc bằng `await cookies()`;
- product default mở, study workspace default đóng; cookie của người dùng luôn được ưu tiên hơn default.

Visual chính thức:

- width desktop 288px nếu page shell hiện tại được giữ;
- deep navy background;
- active item dùng cyan tint, white text, cyan icon;
- hover white 4–6%;
- item height tối thiểu 44px;
- icon 18px;
- section label mono/caption slate-400;
- user region ở footer;
- placeholder/demo menu không được xuất hiện trong production.

### 19.3. Product header

- Height 64px.
- Left: sidebar trigger + breadcrumb/page title.
- Right: contextual actions.
- Border bottom white 6–7%.
- `ProductRouteDescriptor` **[Đã triển khai]** map exact route và dynamic route pattern thành `title`, `breadcrumbs` và `action`.
- Không hard-code title/action trực tiếp trong `SiteHeader`; descriptor phải được cập nhật khi thêm route.
- Không dùng header title thay H1 trong content nếu heading outline cần H1.

`ProductPageHeader` **[Đã triển khai]** thuộc content layer, cung cấp eyebrow, H1, description, actions và optional aside. Nó bổ sung cho `SiteHeader`, không tạo app header thứ hai.

### 19.4. Breadcrumb

**[Đã triển khai trong `SiteHeader`]** qua `ProductBreadcrumb` của route descriptor; hiện chưa tách thành primitive độc lập.

- Dùng khi sâu từ hai cấp trở lên.
- 14px; parent slate-400, current white.
- Separator chevron 14px, `aria-hidden`.
- Current item có `aria-current="page"`.
- Mobile có thể collapse middle items nhưng giữ parent gần nhất/current.
- Không dùng breadcrumb thay back button trong flow task đặc biệt; có thể dùng cả hai khi vai trò khác nhau.

### 19.5. Tabs

Pattern visual bắt nguồn từ `ExperienceShowcase`; reusable `Tabs` **[Đã triển khai]** bằng Base UI:

- `role="tablist"`, `role="tab"`, `role="tabpanel"`;
- roving `tabIndex`;
- Arrow Left/Right/Up/Down;
- Home/End;
- `aria-selected`, `aria-controls`, `aria-labelledby`;
- active indicator white 7–8%, border 10%, optional accent icon;
- inactive slate-500, hover slate-300 + white 3–4%;
- focus ring cyan;
- dynamic panel có `aria-live="polite"` khi phù hợp.

Base UI quản lý roving focus và keyboard navigation cho tab list. Consumer dùng `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`; không tự làm tab bằng div hoặc tự viết lại Arrow/Home/End behavior.

### 19.6. Footer navigation

- Link nhóm nhỏ, dễ scan.
- Hover/focus cyan.
- Không lặp mọi sidebar link nếu không cần.
- Legal/status tách bằng divider.

### 19.7. Navigation copy và brand

- Tên chuẩn: EngFlex.
- Không dùng `href="#"` cho chức năng chưa có.
- Không hiển thị item như có thể dùng nếu không có route/action.
- Icon Home phải biểu đạt Home, không dùng Circle Plus.
- Route title, breadcrumb, page H1 và document metadata phải nhất quán.

### 19.8. Dropdown và tooltip

- Dropdown dùng dark popover, radius 12px, border white 8–10%, elevation 2.
- Item cao tối thiểu 36px desktop và target 44px trên touch.
- Active/focus item dùng cyan/white tint nhẹ, không dùng zinc inversion.
- Destructive item có destructive icon/text và vẫn cần confirmation nếu hậu quả lớn.
- Menu hỗ trợ keyboard và giữ focus behavior của Base UI.
- Tooltip chỉ bổ sung label/context, không chứa hành động thiết yếu.
- Tooltip text 12px; delay ngắn nhưng không bằng 0 cho mọi UI nếu gây nhiễu.
- Icon-only control phải có accessible name dù có tooltip.

---

## 20. Empty State

### 20.1. Trạng thái

`AsyncContentState` **[Đã triển khai]** hỗ trợ `kind="empty"` với heading semantic, description, optional action và `role="status"`. Page vẫn phải cung cấp copy/CTA đúng nguyên nhân; component không thay thế no-result layout đặc thù hoặc collection skeleton.

### 20.2. Các loại empty

| Loại | Nội dung cần có |
|---|---|
| First-use | Giải thích giá trị + một CTA bắt đầu |
| No data | Nói dữ liệu chưa tồn tại và next action |
| No result/filter | Nêu filter/search gây rỗng + reset |
| Completed | Xác nhận hoàn thành + bước tiếp theo |
| Permission-limited | Giải thích quyền và cách yêu cầu truy cập |

Không dùng cùng một copy “Không có dữ liệu” cho mọi trường hợp.

### 20.3. Visual anatomy

- Đặt trong content region/card, không nhất thiết full screen.
- Icon 48–64px hoặc owl cinematic nhỏ khi phù hợp thương hiệu.
- Heading 20–24px semibold, white.
- Body 14–16px, slate-400, cap khoảng 480px.
- Một primary CTA; optional tertiary action.
- Surface dark glass, radius 24–28px, padding 32–48px.
- Không cần deep hero shadow hoặc nhiều glow.

### 20.4. Accessibility

- Heading semantic.
- Nếu empty xuất hiện sau async action, region có status announcement phù hợp.
- CTA keyboard accessible.
- Illustration không thay copy.
- Không hiển thị empty trước khi request đầu tiên hoàn tất.

---

## 21. Loading State

### 21.1. Trạng thái

**[Quan sát]**

- `Skeleton` primitive có pulse.
- `SidebarMenuSkeleton` và page-specific skeleton có thể giữ footprint của navigation/grid.
- `AsyncContentState` **[Đã triển khai]** hỗ trợ generic content loading với `aria-busy`, status copy và skeleton text.
- Home không có page/data loading state.

Topics **[Đã triển khai]** route-level `loading.tsx` với skeleton đúng footprint; route product khác hiện xử lý loading trong page. `AsyncContentState` không được dùng thay layout-shaped skeleton khi page đã biết cấu trúc card/grid thật.

### 21.2. Loading hierarchy

| Tình huống | Pattern |
|---|---|
| First page load | Page/content skeleton giữ đúng layout |
| Section refresh | Skeleton hoặc retained content + subtle busy state |
| Button submit | Disabled, `aria-busy`, giữ width, loading label |
| Inline metric | Giữ label, skeleton riêng value |
| Long process | Progress có label/percent nếu dữ liệu thật |

Không thay toàn page bằng spinner giữa canvas nếu có thể dựng skeleton có cấu trúc.

### 21.3. Skeleton

- Surface dùng white 5–8% hoặc muted token trên dark canvas.
- Radius theo element thật.
- Text skeleton có nhiều width hợp lý, không random quá mức làm layout nhấp nháy.
- Media skeleton giữ aspect ratio.
- Card grid skeleton giữ đúng số cột tại breakpoint.
- Không render empty state trong khi skeleton còn active.

### 21.4. Motion

- Chỉ dùng pulse đã tồn tại.
- Không thêm shimmer/keyframe mới.
- Với reduced motion, dùng skeleton tĩnh hoặc duration gần 0.
- Không animate layout liên tục.

### 21.5. Accessibility

- Content container dùng `aria-busy="true"`.
- Có status text cho screen reader khi chờ đáng kể.
- Tránh announce mỗi skeleton.
- Khi load xong, focus không tự nhảy trừ flow yêu cầu.
- Retain previous content khi refresh để giảm mất context.

---

## 22. Error State

### 22.1. Trạng thái

`AsyncContentState` **[Đã triển khai]** hỗ trợ `kind="error"`, destructive semantic token, `role="alert"` và optional retry. Route-level `error.tsx` vẫn là **[Khoảng trống]**. Home không có error visual và rose trên Home vẫn là recording/window indicator, không phải error system.

Pattern dưới đây là **[Chuẩn hóa]** cho product app và dùng destructive semantic token hiện có.

### 22.2. Error levels

| Cấp | Vị trí | Nội dung |
|---|---|---|
| Field | Ngay dưới control | Lỗi cụ thể + cách sửa |
| Inline/section | Trong region lỗi | Mô tả + retry |
| Page recoverable | Main content | Giữ nav/shell + retry/back |
| Fatal/unavailable | Page state | Heading, explanation, safe next action |
| Destructive confirm | Modal | Hậu quả + cancel + destructive action |

### 22.3. Visual

- Surface dark glass, không chuyển toàn page sang đỏ.
- Border destructive khoảng 20–30%.
- Error icon 20–24px.
- Heading white; body slate-300/400; destructive dùng cho icon/key phrase.
- Radius 16–24px inline, 24–28px page state.
- Retry dùng primary/secondary button phù hợp.

### 22.4. Copy

- Nói điều gì xảy ra.
- Nói dữ liệu/hành động nào bị ảnh hưởng.
- Đưa cách khôi phục.
- Không hiển thị stack trace hoặc raw API response.
- Không đổ lỗi người dùng.
- Không dùng “Something went wrong” nếu có thể cụ thể hơn.

### 22.5. Behavior

- Error region dùng `role="alert"` khi xuất hiện sau action.
- Retry không reload toàn app nếu chỉ section lỗi.
- Giữ input/filter/user data.
- Log kỹ thuật có thể tồn tại nhưng không thay UI.
- Invalid route/category không âm thầm fallback sang dữ liệu khác.
- Destructive action phải có cancel rõ và focus an toàn.

---

## 23. Accessibility

### 23.1. Mục tiêu

Tối thiểu WCAG 2.2 AA cho contrast, keyboard, focus, semantics và target size. Pattern tốt nhất hiện có là Home navigation và `ExperienceShowcase`.

### 23.2. Contrast

- Normal text: tối thiểu 4.5:1.
- Large text: tối thiểu 3:1.
- UI component/focus boundary: tối thiểu 3:1 với nền lân cận.
- slate-500 trên canvas chỉ khoảng 4.13:1: không dùng cho normal text quan trọng.
- white 42% chỉ khoảng 4.03:1: chỉ dùng large text.
- white 35% khoảng 3.13:1: chỉ decorative/nonessential.
- Không đặt text trên aurora/glow mà không kiểm tra contrast ở vị trí xấu nhất.

### 23.3. Keyboard

- Mọi action dùng link/button/control semantic.
- Không dùng clickable div.
- Tab order theo visual/reading order.
- Focus-visible luôn rõ.
- Modal trap focus và restore focus.
- Tabs hỗ trợ Arrow/Home/End như Home.
- Menu/Sheet đóng bằng Escape.
- Hover-only content phải có keyboard/tap equivalent.

### 23.4. Focus

- Focus ring cyan 2px, offset 4px.
- Không cắt focus ring bằng `overflow-hidden`; nếu bắt buộc, dùng inset/ring phù hợp.
- Focus không chỉ đổi màu.
- Không hiển thị focus ring liên tục cho pointer interaction nếu `focus-visible` xử lý được.
- Sau validation, đưa focus có chủ đích đến lỗi/summary.

### 23.5. Semantics

- Một H1 mỗi page; heading không được giả bằng div.
- Section có heading hoặc accessible label.
- Navigation có `nav` + accessible name.
- Card navigation là link; card action là button.
- Table dùng semantic table.
- Form group dùng fieldset/legend khi phù hợp.
- Current nav/breadcrumb có `aria-current`.
- Dialog dùng Title/Description primitives.

### 23.6. Screen reader

- Decorative icon/layer `aria-hidden`.
- Icon-only control có accessible name.
- Dynamic feedback dùng `aria-live="polite"` hoặc `role="status"`.
- Error dùng `role="alert"` hợp lý.
- Loading container `aria-busy`.
- Image alt mô tả mục đích, không dùng “Image”.
- Không announce decoration, waveform giả hoặc glow.

### 23.7. Touch target

- Tối thiểu 44×44px.
- Ưu tiên 48px cho form/button/product action.
- Visual icon có thể 16px nhưng hit area phải đủ lớn.
- Khoảng cách giữa adjacent targets tối thiểu 8px khi có thể.

### 23.8. Motion

- Tôn trọng `prefers-reduced-motion`.
- Parallax/tilt không chạy trên touch/fine-pointer mismatch.
- Reduced motion bỏ loop, translate, scale và smooth scroll.
- Không dùng motion để truyền tải thông tin duy nhất.
- Không thêm animation ngoài inventory tại Phụ lục B.
- Product entrance dùng `ProductReveal`; không tạo reveal wrapper khác với easing/duration riêng.

### 23.9. Readability

- Body không nhỏ hơn 14px; body chính 16px.
- Micro-label không dưới 10px cho nội dung đọc.
- Paragraph line-height 1.6–1.75.
- Line length 55–72 ký tự.
- Không viết toàn bộ đoạn bằng uppercase.
- Copy tiếng Việt nhất quán; tránh trộn tiếng Anh scaffold khi không có chủ đích học tập.

### 23.10. Known accessibility gaps không được lặp lại

- Landing Experience flashcard vẫn cần được audit riêng; product flashcard đã dùng button và ẩn mặt không hoạt động khỏi accessibility tree.
- Landing mobile nav icon 40px nhỏ hơn target 44px; product sidebar trigger đã đạt 44px.
- Auth image alt là “Image”.
- Các page legacy có thể vẫn thiếu async announcement hoặc dùng feedback ngoài UI; page migration phải dùng system state mới.
- Route-level boundary mới có đầy đủ ở Topics, chưa đồng đều trên mọi route product.

Product foundation đã xử lý route-aware SiteHeader, một skip link tới `main#main-content`, target sidebar trigger 44px, `AsyncContentState` có status/alert semantics và reduced-motion coverage cho `.product-shell`.

---

## 24. Responsive Rules

### 24.1. Mobile: dưới 640px

Layout:

- Gutter 20px.
- Một cột.
- CTA group stack dọc, button có thể full-width.
- Card padding 24px.
- Grid bài học/category một cột.
- Section spacing 80–112px tùy cấp.

Home behavior:

- Logo + hamburger; nav CTA nằm trong menu.
- Hero H1 tối thiểu 51.2px, CTA 48px.
- Hero visual min-height khoảng 480px, gần vuông.
- Floating metric/voice badges ẩn.
- Value strip stack với divider ngang.
- Feature/method/experience/CTA stack.
- Grid background giảm density; aurora blur giảm.

Rules:

- Không đặt bốn card trên một hàng.
- Không dùng fixed width > viewport.
- Không phụ thuộc hover.
- Modal width = viewport trừ 32px; content dài scroll.
- Table scroll ngang hoặc chuyển card.

### 24.2. Small: 640–767px

- Gutter 32px.
- Hero CTA có thể chuyển row.
- Large CTA cao 56px.
- Hero visual min-height khoảng 590px và aspect rộng hơn.
- Floating hero badges có thể xuất hiện nếu không che nội dung.
- Card padding 32px.
- Section heading 48px.
- Nav CTA xuất hiện, hamburger vẫn tồn tại.
- Form vẫn ưu tiên một cột.

### 24.3. Tablet: 768–1023px

- App sidebar chuyển sang desktop behavior từ 768px; kiểm tra content width còn lại.
- Value strip thành ba cột.
- Footer chuyển row.
- Product card grid thường hai cột.
- Study option có thể hai cột nếu mỗi card đủ rộng.
- Landing nav vẫn dùng hamburger tới dưới 1024px.
- Hero/feature/experience/method/final CTA vẫn ưu tiên stack nếu chưa tới `lg`.
- Orbit phụ ẩn dưới 1024px.

### 24.4. Desktop: 1024–1279px

- Gutter 40px; hero/experience 48px.
- Desktop landing links hiện; hamburger ẩn.
- Hero hai cột `0.92fr / 1.08fr`.
- Bento dùng 12 cột.
- Experience `1.35fr / .65fr`.
- Method ba cột.
- Final CTA `1.15fr / .85fr`.
- Scroll cue hiện.
- Section spacing có thể đạt 144px.
- Product grid 3–4 cột nếu card minimum width đạt yêu cầu.

### 24.5. Wide: 1280–1535px

- Container vẫn cap 1280/1320/1440px.
- Hero gap có thể tăng 64px.
- Hero visual có negative right margin có chủ đích.
- Decorative word cards trong Method có thể xuất hiện.
- Không tăng body line length.
- Không thêm cột chỉ vì còn khoảng trống.

### 24.6. Ultra-wide: từ 1536px

- Không có Home override riêng; đây là behavior chuẩn.
- Giữ content cap.
- Tăng outer whitespace.
- Atmospheric glow có thể mở rộng nhưng không làm content loãng.
- Product dashboard có thể dùng 1440px nếu data density thật sự cần; prose vẫn cap.

### 24.7. Test matrix bắt buộc

Mỗi page phải kiểm tra tối thiểu:

- 375×812 hoặc tương đương mobile;
- 640px;
- 768px;
- 1024px;
- 1280/1440px;
- 1920px;
- keyboard-only;
- reduced motion;
- content dài và content rỗng.

Kiểm tra thêm zoom 200% và text wrapping tiếng Việt.

---

## 25. Do & Don't

### Do

- Dùng `/home` làm visual source of truth.
- Dùng tên thương hiệu **EngFlex**.
- Dùng owl cinematic làm mascot chính.
- Dùng canvas `#050B18` cho dark product/marketing shell.
- Dùng canonical cyan `#6EE7F2` và gold `#F7C76F`.
- Dùng cyan cho active/info/focus và gold cho conversion/practice.
- Dùng emerald cho success, violet cho supporting skill.
- Dùng Geist và Geist Mono đúng vai trò.
- Dùng type scale chuẩn và heading semantic.
- Dùng spacing scale 4px.
- Giữ gutter 20/32/40–48px.
- Cap container 1280/1320/1440px theo vai trò.
- Giữ prose 55–72 ký tự mỗi dòng.
- Dùng card radius 28–32px và control radius 12–16px.
- Dùng inner surface tối hơn outer surface.
- Dùng border trắng 6–10% và inset highlight nhẹ.
- Dùng elevation đúng cấp.
- Giữ một accent chính trên mỗi card/section.
- Giữ một primary CTA trong mỗi action region.
- Dùng action height 48px; hero 56px.
- Dùng Lucide icon và accessible label.
- Dùng link/button semantic cho interactive card.
- Dùng reusable Base UI `Tabs`; giữ roving keyboard pattern của ExperienceShowcase.
- Dùng `ProductShell`, `ProductRouteDescriptor`, `ProductPageHeader`, `AsyncContentState` và `ProductReveal` thay vì tạo bản page-local trùng chức năng.
- Thiết kế đủ loading, empty, error và retry.
- Giữ layout khi loading bằng skeleton đúng hình dạng.
- Tôn trọng reduced motion.
- Kiểm tra contrast, keyboard, screen reader và touch target.
- Dùng `next/image` và `sizes` đúng layout.
- Stack mobile theo reading order.
- Dùng tablet 2-column khi desktop là 3–4 column.
- Giữ nav/header/sidebar cùng một app shell.
- Dùng breadcrumb khi hierarchy từ hai cấp.
- Dùng FieldError/`aria-invalid` cho validation.
- Ghi rõ **[Suy ra]** nếu pattern chưa có trên Home.
- Cập nhật tài liệu khi source of truth thay đổi có chủ đích.

### Don't

- Không lấy shadcn neutral hiện tại làm final EngFlex style.
- Không hard-code thêm màu hex/rgba gần giống.
- Không dùng “EngFlix”.
- Không dùng Command/Gallery icon làm logo.
- Không trộn nhiều mascot/illustration style.
- Không đặt light PNG nền trắng trên dark card tùy tiện.
- Không dùng glass trên mọi element.
- Không dùng glow trên mọi card.
- Không đặt nhiều gradient text trong một viewport.
- Không dùng gradient cho body/form/table content.
- Không dùng slate-500 cho body nhỏ quan trọng.
- Không dùng white 35–42% cho normal text.
- Không dùng arbitrary padding/radius mới nếu scale đã có.
- Không trộn card radius 12px neutral với feature radius 32px cùng cấp.
- Không tạo nhiều primary CTA cạnh nhau.
- Không dùng button 32px cho touch action chính.
- Không dùng clickable `div`.
- Không dùng hover-only interaction.
- Không dùng fixed `grid-cols-4` trên mobile.
- Không kéo container/prose full width trên ultra-wide.
- Không dùng `console.error` hoặc browser `alert()` làm UX.
- Không hiển thị empty state trong lúc loading.
- Không xóa input khi validation/server error.
- Không dùng placeholder thay label.
- Không báo lỗi chỉ bằng màu.
- Không coi rose recording là error token mặc định.
- Không nói Table/DataTable, Checkbox, Radio, Switch, Pagination hoặc route-level state đã tồn tại khi chưa có; `Select`, `Textarea`, `Tabs`, `AlertDialog` và `AsyncContentState` đã là inventory chính thức.
- Không tự thêm spinner/shimmer/bounce/parallax mới.
- Không bỏ focus outline.
- Không animate khi reduced motion.
- Không để decoration trong accessibility tree.
- Không dùng alt “Image”.
- Không hard-code page title không khớp route.
- Không hiển thị navigation item giả với `href="#"` như chức năng thật.
- Không dùng H1 cho số đếm/metadata.
- Không dùng font mono cho paragraph.
- Không dùng micro text dưới 10px cho thông tin cần đọc.
- Không dùng table desktop bị ép nhỏ trên mobile.
- Không tạo component trùng chức năng nếu primitive/pattern đã có.
- Không refactor visual trước khi xác định observed/normalized/provisional status.

---

## 26. Checklist Khi Thiết Kế Một Page Mới

### Nguồn chuẩn và thương hiệu

- [ ] Page đã tham chiếu `/home` và tài liệu này chưa?
- [ ] Tên hiển thị là EngFlex chưa?
- [ ] Brand mark/mascot đúng cinematic variant chưa?
- [ ] Có trộn neutral scaffold hoặc visual style khác Home không?

### Color và surface

- [ ] Canvas/surface dùng canonical palette chưa?
- [ ] Có literal màu mới không?
- [ ] Cyan, gold, violet, emerald đúng semantic role chưa?
- [ ] Có quá nhiều accent/glow/gradient không?
- [ ] Inner surface tối hơn outer surface chưa?
- [ ] Border và shadow đúng elevation chưa?

### Typography

- [ ] Chỉ có một H1 chưa?
- [ ] Heading level đúng outline chưa?
- [ ] Cỡ/weight/tracking đúng type scale chưa?
- [ ] Body line-height và line length hợp lý chưa?
- [ ] Micro text có đủ lớn và đủ contrast không?
- [ ] Geist Mono chỉ dùng cho metadata/metric chưa?
- [ ] Copy tiếng Việt nhất quán chưa?

### Spacing và layout

- [ ] Gutter đúng 20/32/40–48px chưa?
- [ ] Container đúng 1280/1320/1440px chưa?
- [ ] Spacing nằm trong scale chưa?
- [ ] Section rhythm và card padding nhất quán chưa?
- [ ] Có margin/pixel lẻ không cần thiết không?
- [ ] Hierarchy có rõ khi bỏ decoration không?

### Component

- [ ] CTA có một primary rõ chưa?
- [ ] Action height đạt 44–48px chưa?
- [ ] Button có hover/active/focus/disabled/loading spec chưa?
- [ ] Card đúng tier/radius/padding/elevation chưa?
- [ ] Interactive card dùng link/button chưa?
- [ ] Form có label/helper/error semantics chưa?
- [ ] Modal dùng Title/Description/focus trap chưa?
- [ ] Tabs có roving keyboard behavior chưa?
- [ ] Icon đúng Lucide/size/aria chưa?
- [ ] Illustration đúng asset/aspect/alt chưa?

### Data và system states

- [ ] Có first-load state chưa?
- [ ] Skeleton giữ đúng layout chưa?
- [ ] Có empty state đúng nguyên nhân chưa?
- [ ] Có error message và retry chưa?
- [ ] Có success/feedback rõ chưa?
- [ ] Có giữ user data/context khi lỗi hoặc refresh không?
- [ ] Có tránh empty flash trước khi fetch hoàn tất không?

### Responsive

- [ ] Mobile stack đúng reading order chưa?
- [ ] Tablet có layout trung gian hợp lý chưa?
- [ ] Desktop grid chỉ bật khi card đủ rộng chưa?
- [ ] Ultra-wide có cap content chưa?
- [ ] Table/modal/navigation có mobile strategy chưa?
- [ ] Hover effect có touch/keyboard equivalent chưa?
- [ ] Đã test 375, 640, 768, 1024, 1440 và 1920px chưa?
- [ ] Đã test zoom 200% và copy dài chưa?

### Accessibility

- [ ] Contrast đạt AA chưa?
- [ ] Touch target tối thiểu 44×44px chưa?
- [ ] Mọi action dùng semantic element chưa?
- [ ] Focus-visible rõ và không bị cắt chưa?
- [ ] Keyboard có dùng hết flow được không?
- [ ] Screen reader có accessible name/heading/status chưa?
- [ ] Async region có `aria-busy/status/alert` phù hợp chưa?
- [ ] Decorative layer/icon đã `aria-hidden` chưa?
- [ ] Image alt đúng mục đích chưa?
- [ ] Reduced motion có tắt transform/loop/smooth scroll chưa?

### Final QA

- [ ] Page có cảm giác cùng một sản phẩm với Home không?
- [ ] Có pattern nào được suy ra nhưng chưa gắn nhãn không?
- [ ] Có component nào bị mô tả như đã tồn tại nhưng thực tế chưa có không?
- [ ] Có regression ở loading/empty/error/keyboard không?
- [ ] Tài liệu có cần cập nhật vì quyết định mới không?

---

# Phụ lục A — Component Inventory

## A.1. Primitive hiện có

| Component | Khả năng hiện có | Khoảng trống chính |
|---|---|---|
| Button | Base variants + `product`/`glass`; `app` 48px và `icon-app` 44px; focus/active/disabled/invalid | Chưa có prop loading thống nhất |
| Badge | 6 variants, pill | Chưa có success/warning/info semantic variants |
| Card | Header/Title/Description/Action/Content/Footer; `product`/`inner` visual variants | Chưa có interactive/selected/loading API thống nhất |
| Input | Focus/disabled/invalid | 32px; chưa size/icon/success |
| Label | Label + disabled | — |
| Field | Fieldset, legend, orientation, helper, error alert | Error chưa được dùng trong forms |
| Dialog | Portal, overlay, close, title, description, footer | Consumer StudyMode chưa dùng semantics/EngFlex visual |
| AlertDialog | Base UI portal/backdrop/popup/title/description/close; product visual; confirmation footer | Consumer phải quản lý pending/error của action |
| Sheet | 4 sides, overlay, transition | Chủ yếu dùng cho sidebar |
| DropdownMenu | Group, item, destructive, submenu, checkbox/radio, shortcut | Nhiều feature chưa có call site |
| Avatar | Size, fallback, badge, group | Badge/group chưa dùng |
| Sidebar | Desktop/mobile Sheet, collapse, cookie, shortcut, tooltip, skeleton; product tokens | Presence/online state không thuộc sidebar primitive |
| Skeleton | Pulse block | Route/page vẫn cần skeleton đúng footprint |
| Tooltip | Base UI tooltip; provider mount tại root layout | Không chứa action thiết yếu |
| Separator | Horizontal/vertical | — |
| AspectRatio | CSS aspect wrapper | — |
| Tabs | Base UI root/list/tab/panel; horizontal/vertical; roving keyboard; product visual | Consumer tự quyết định live announcement cho dynamic content |
| Select | Base UI trigger/value/popup/items/scroll controls; keyboard/typeahead | Form-level validation feedback do consumer nối |
| Textarea | Native semantic control; product focus/invalid/disabled states | Form-level counter/success do consumer nối |

## A.2. Application component hiện có

| Component | Vai trò | Ghi chú |
|---|---|---|
| ProductShell | Shared product/study shell | Một skip link, sidebar, SiteHeader và `main#main-content`; nhận server-derived sidebar default |
| AppSidebar | App navigation | EngFlex navigation, active route, authenticated profile link, mobile Sheet |
| NavMain | Active route navigation | Semantic links và icon đúng route |
| SiteHeader | Route-aware product header | Resolve `ProductRouteDescriptor` cho title/breadcrumb/action |
| ProductPageHeader | Content heading | Eyebrow + một H1 + description + actions/aside |
| AsyncContentState | Loading/empty/error state | Status/alert semantics, `aria-busy`, retry/action |
| ProductReveal | Controlled product entrance | 0.65s, easing chuẩn, viewport reveal, reduced-motion safe |
| NavUser | User dropdown/profile action | Dữ liệu auth thật trong AppSidebar |
| NavSecondary | Secondary nav | Có source nhưng chưa dùng |
| NavDocuments | Document nav/dropdown | Có source nhưng chưa dùng |
| LoginForm | Email/password form | Chưa submit/loading/error |
| SignupForm | Registration fields | Chưa validation/submit states |
| CategoryCard | Category heading + link | Neutral visual |
| LessonCard | Thumbnail/badges | Semantic overlay button 44px+, keyboard focus và reduced-motion safe |
| StudyModeDialog | Hai study options | Dialog semantics, focus trap/restore và hai mode là button |
| CategoryLessons | Category/lesson fetch | Preview được gom bằng `Promise.allSettled`, grid skeleton và state phân biệt lỗi |
| LessonDetail | Category lesson grid | Responsive grid với loading/empty/error/retry và not-found riêng |

## A.3. Home-specific component

- `LandingNav`.
- `Reveal`.
- `HeroVisual`.
- `ExperienceShowcase`.
- `ValueStrip`.
- `FeatureGrid`.
- `MethodSection`.
- `FinalCta`.
- `LandingFooter`.
- Private patterns: `SectionEyebrow`, `FeatureLabel`, Experience stage variants.
- `TiltCard` có source/export nhưng chưa có call site.

## A.4. Chưa tồn tại hoặc chưa được chuẩn hóa thành primitive dùng chung

- Table/DataTable component.
- Checkbox.
- Radio.
- Switch.
- Breadcrumb primitive độc lập; breadcrumb route-aware đã có trong `SiteHeader`.
- Pagination.
- Progress primitive.
- Toast usage.
- Alert.
- EmptyState/ErrorState độc lập; ba state generic đã có qua `AsyncContentState`.
- Route-level LoadingState/ErrorState/not-found chưa được chuẩn hóa ngoài Topics.
- Button loading.
- Search/filter component.

Không được yêu cầu Agent “dùng component có sẵn” cho danh sách A.4. Với `Select`, `Textarea`, `Tabs`, `AlertDialog`, `ProductPageHeader`, `AsyncContentState` và `ProductReveal`, phải tái sử dụng implementation hiện có thay vì tạo page-local duplicate.

---

# Phụ lục B — Motion & Animation Inventory

## B.1. Nguyên tắc

Chỉ phân tích và cho phép pattern motion đang có. Không tự thêm animation mới.

Motion có ba nhóm:

1. Ambient cinematic.
2. Entrance/state transition.
3. Direct interaction feedback.

### B.2. CSS animation đang có

| Pattern | Duration | Easing/loop | Hiện trạng |
|---|---:|---|---|
| Perspective grid drift | 12s | linear infinite | Đang dùng |
| Aurora breathe | 9s | ease-in-out alternate infinite | Đang dùng |
| Gradient text shimmer | 7s | ease-in-out alternate infinite | Đang dùng |
| Scroll cue | 2.4s | ease-in-out infinite | Đang dùng desktop |
| Float | 5s/7s | ease-in-out infinite | Helper có source; call site hạn chế/không rõ |
| Sound wave | 1.05s | ease-in-out alternate | Helper có source |
| Marquee | 24s | linear infinite | Class có source, không có rendered call site |
| Flashcard flip | 300ms | transform | Button hỗ trợ keyboard/touch; mặt ẩn có `aria-hidden`, reduced-motion không transform |
| Card/icon hover | 300–500ms | transform/color | Đang dùng |

### B.3. Motion React đang có

| Pattern | Thông số |
|---|---|
| Nav entrance | y -24 + opacity, 0.55s ease-out |
| Mobile menu | height/opacity, 0.25s |
| Reveal | y 28 + opacity, 0.65s, bezier [.22,1,.36,1], viewport amount .18 |
| ProductReveal | y 28 + opacity, 0.65s, bezier [.22,1,.36,1], viewport amount .18, once; stagger call site theo bước .07s |
| Hero cockpit entrance | y 26 + scale .96 + opacity, 0.8s |
| Pointer tilt | spring; only fine pointer, non-touch |
| Hero parallax | rotateX ±5.5°, rotateY ±7.5°, layer ±14/10px |
| Tab active indicator | layout transition khoảng 0.3s |
| Experience stage | opacity/scale/y, khoảng 0.34–0.45s |
| Practice glow/ring | 2.2s/1.7s loop |
| Waveform | khoảng .9–1.15s loop |
| Hero owl rotation | 5.5s loop |
| Metric entrance | khoảng .35s, stagger .07s |

### B.4. Reduced motion

- Interactive components dùng `useReducedMotion()`.
- Server sections dùng `motion-safe`/`motion-reduce`.
- `ProductReveal` đưa `initial=false` và duration về 0 khi người dùng yêu cầu reduced motion.
- `.landing-shell` và `.product-shell` có media query đưa animation/transition về 0.01ms, loop về một lần và tắt smooth scroll.
- Dialog/AlertDialog/Sheet phải bỏ transform/slide/zoom qua `motion-reduce`.

### B.5. Motion gaps

- Hero dùng `Reveal eager` với `initial=false` nhưng không có `animate/whileInView`; các delay truyền vào không tạo stagger reveal thực tế.
- `TiltCard` được export nhưng không dùng.
- Nhiều helper `.landing-card`, perspective/depth, float, sound-bar, marquee và mask-fade chưa có rendered call site.
- Landing `Reveal` và product `ProductReveal` là hai scope khác nhau; product pages không import Landing wrapper.
- Coverage reduced motion đã mở rộng tới `.product-shell`; route ngoài hai shell vẫn phải được audit riêng.

### B.6. Motion rules

- Không thêm keyframe/easing/duration mới.
- Product entrance dùng đúng 0.65s, easing `[.22,1,.36,1]`; collection stagger tăng theo bước 0.07s và không tạo nhiều live announcement.
- State transition dùng 0.25–0.45s.
- Hover dùng 0.24–0.5s.
- Ambient loop chỉ trên decoration, không trên critical content.
- Không thêm bounce, spin hoặc pulse trang trí; pulse skeleton chỉ thể hiện loading thật.
- Không chạy parallax trên touch.
- Không dùng animation che loading chậm.
- Không animate layout gây reflow liên tục.
- Khi reduced motion bật, mọi transform và loop phải tắt; thông tin và feedback vẫn phải đầy đủ ở trạng thái tĩnh.

---

# Phụ lục C — UX Pattern Audit

## C.1. Khoảng trắng

Home dùng whitespace rộng, section 80–144px, heading/copy cap và card gap 16–20px. Đây là một phần của brand premium; không nén page app tới mức dashboard generic.

## C.2. Điều hướng

Home có fixed nav, anchor scroll có `scroll-mt-24`, mobile disclosure và footer links. Product navigation hiện chưa cùng visual language và còn demo content; app page mới phải dùng một shared shell.

## C.3. Thứ tự đọc

Home tạo hierarchy:

1. Eyebrow.
2. Heading.
3. Description.
4. Primary/secondary CTA.
5. Supporting proof.
6. Demonstration.

Page app có thể rút gọn nhưng giữ thứ tự: page context → primary task → data/content → feedback → next action.

## C.4. CTA

CTA chính trên Home đều dẫn tới học/chủ đề; CTA phụ giải thích hoặc mở vocabulary. Không có CTA mơ hồ. Page mới phải giới hạn primary CTA và dùng copy theo kết quả.

## C.5. Form UX

Auth hiện chỉ là scaffold: chưa submit handler, pending, error, success, password matching/strength. Không lấy auth hiện tại làm form UX chuẩn; dùng mục 15.

## C.6. Feedback

Home diễn đạt feedback qua waveform, score, progress, status badge và active tabs. Các page khác dùng browser alert hoặc console; đây là gap. Feedback mới phải nằm trong UI và có screen-reader announcement.

## C.7. Loading/empty/error

- Product pages dùng layout-shaped skeleton hoặc `AsyncContentState` cho loading, empty, error và retry; background refresh giữ dữ liệu cũ khi workflow yêu cầu.
- Topics có thêm route-level loading/error/not-found; các route khác quản lý state tại page/workspace.
- Legacy pages ngoài phạm vi migration vẫn có thể còn plain text, browser feedback hoặc console-only error và phải được audit khi chạm tới.

Mục 20–22 là chuẩn bắt buộc cho page mới.

---

# Phụ lục D — Độ lệch hiện tại so với Home

| Page/khu vực | Độ lệch chính |
|---|---|
| `/login` | Neutral split scaffold, EngFlix, generic icon, ảnh tông ấm, form thiếu states |
| `/signup` | Tương tự login; thiếu validation/submit states |
| `/topics` | **Đã đồng bộ:** ProductShell, capped container, cinematic cards, centralized preview fetch và đủ loading/empty/error/retry |
| `/topics/[categoryId]` | **Đã đồng bộ:** responsive auto-fill grid, heading đúng cấp, route/content states và controlled reveal |
| `/vocabulary`, `/vocabulary/quiz` | **Đã đồng bộ:** library/mine browser, owner CRUD, responsive item list, semantic flashcard và quiz state machine trong study shell |
| Social pages | **Đã đồng bộ:** Community/Profile dùng shared post primitives; Friends dùng Base UI Tabs; Chat là community cockpit không giả lập direct message |
| Notes/Progress | **Đã đồng bộ:** quote-card notes states và bento/Recharts report có accessible summary/reduced motion |
| AppSidebar | **Đã đồng bộ:** EngFlex navigation, auth/profile thật, 44px actions, mobile Sheet và cookie state |
| SiteHeader | **Đã đồng bộ:** `ProductRouteDescriptor` cho title, breadcrumb và contextual action |
| StudyModeDialog | **Đã đồng bộ:** semantic Dialog, keyboard/touch buttons và cinematic mascot assets |
| LessonCard | **Đã đồng bộ:** semantic button overlay, focus-visible, responsive image sizes và reduced-motion coverage |

Các dòng **Đã đồng bộ** là implementation inventory, không phải khoảng trống cần sao chép lại. Login/signup vẫn là legacy ngoài phạm vi redesign này.

---

# Phụ lục E — Evidence Map

| Nội dung | Source chính |
|---|---|
| Root redirect | `frontend/app/page.tsx:1-5` |
| Home composition | `frontend/app/home/page.tsx:31-157` |
| Hero | `frontend/app/home/page.tsx:37-118` |
| Experience heading | `frontend/app/home/page.tsx:123-148` |
| Landing nav | `frontend/components/landing/landing-interactions.tsx:121-255` |
| Reveal/Tilt | `frontend/components/landing/landing-interactions.tsx:257-338` |
| Hero visual | `frontend/components/landing/landing-interactions.tsx:340-541` |
| Experience tabs/stages | `frontend/components/landing/landing-interactions.tsx:543-828` |
| Value strip | `frontend/components/landing/landing-sections.tsx:71-125` |
| Feature bento | `frontend/components/landing/landing-sections.tsx:127-385` |
| Method | `frontend/components/landing/landing-sections.tsx:387-464` |
| Final CTA | `frontend/components/landing/landing-sections.tsx:466-532` |
| Footer | `frontend/components/landing/landing-sections.tsx:534-594` |
| Global semantic tokens | `frontend/app/globals.css:7-118` |
| Landing visual CSS | `frontend/app/globals.css:133-490` |
| Font/root layout | `frontend/app/layout.tsx:1-37` |
| Button primitive | `frontend/components/ui/button.tsx:6-58` |
| Card primitive | `frontend/components/ui/card.tsx:5-103` |
| Input/Field | `frontend/components/ui/input.tsx`, `frontend/components/ui/field.tsx` |
| Dialog/Sheet | `frontend/components/ui/dialog.tsx`, `frontend/components/ui/sheet.tsx` |
| Sidebar | `frontend/components/ui/sidebar.tsx` |
| Current topic states | `frontend/components/topics/home.tsx`, `frontend/components/topics/lessonDetail.tsx` |

---

## Governance

- Tài liệu này là chuẩn thiết kế; implementation hiện tại có thể chưa đạt.
- Khi implementation phase bắt đầu, không “sửa cho giống Home” bằng hard-code mới. Phải map canonical rules thành token/component API có kiểm soát.
- Mọi pattern mới cần ghi rõ: observed, normalized hay provisional.
- Mọi thay đổi palette/type/spacing/radius/motion cấp hệ thống phải cập nhật tài liệu.
- Review UI phải dùng checklist mục 26 và test matrix mục 24.
- Không đánh dấu page hoàn thành nếu thiếu loading, empty, error, responsive hoặc accessibility state.
