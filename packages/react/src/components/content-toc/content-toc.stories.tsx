import type {ContentTocProps} from "./index";
import type {Meta, StoryObj} from "@storybook/react";

import {useEffect, useId, useLayoutEffect, useMemo, useRef, useState} from "react";
import {tv} from "tailwind-variants";

import {Button} from "../button";
import {ToggleButton} from "../toggle-button";
import {ToggleButtonGroup} from "../toggle-button-group";

import {ContentToc} from "./index";

/* Demo canvas only. ContentToc itself never positions or caps itself: placement is the consumer's. */
const demo = tv({
  slots: {
    canvas: "min-h-screen bg-background p-4 text-foreground sm:p-8",
    frame:
      "relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-border bg-surface shadow-sm",
    toolbar: "flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4",
    identity: "flex items-center gap-3",
    monogram:
      "flex size-9 items-center justify-center rounded-lg bg-foreground text-xs font-semibold text-background",
    toolbarTitle: "text-sm font-semibold",
    eyebrow: "text-xs tracking-wide text-muted",
    controls: "flex flex-wrap items-center gap-3",
    controlLabel: "mb-1.5 block text-[10px] font-medium tracking-wider text-muted",
    reader:
      "h-[min(760px,82vh)] min-h-96 overflow-y-auto overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset",
    layout: "grid items-start gap-10 p-6 md:gap-12 md:p-10 lg:gap-20 lg:px-14",
    article: "min-w-0",
    articleHeader: "space-y-5 border-b border-border pb-9",
    breadcrumb: "text-xs font-medium tracking-widest text-accent uppercase",
    title: "text-3xl leading-tight font-semibold tracking-tight sm:text-4xl",
    lead: "max-w-xl text-base leading-8 text-muted",
    meta: "flex items-center gap-3 text-xs text-muted",
    dot: "size-1 rounded-full bg-muted/50",
    section: "space-y-5 border-b border-border py-9 last:border-0 last:pb-28",
    heading:
      "scroll-mt-10 text-xl leading-relaxed font-semibold tracking-tight outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-focus",
    paragraph: "text-sm leading-8 text-muted",
    callout:
      "rounded-xl border border-accent/15 bg-accent/5 px-5 py-4 text-sm leading-7 text-foreground",
    calloutLabel: "mb-1 block text-xs font-semibold tracking-wide text-accent",
    example:
      "rounded-xl border border-border bg-background p-5 font-mono text-xs leading-7 text-muted",
    aside:
      "sticky top-6 order-first self-start rounded-xl bg-surface/95 backdrop-blur-sm max-md:static md:top-10 md:order-last",
    asideList: "max-h-44 md:max-h-[calc(min(760px,82vh)-180px)]",
    floating: "absolute right-4 bottom-16 z-20 max-w-[calc(100%-32px)] sm:right-7",
    footer:
      "flex flex-wrap items-center justify-between gap-2 border-t border-border px-6 py-3 text-xs text-muted",
    status: "flex items-center gap-2",
    statusDot: "size-1.5 rounded-full bg-accent",
  },
  variants: {
    depth: {
      2: {},
      3: {heading: "text-lg"},
      4: {heading: "text-base"},
    },
    presentation: {
      sidebar: {layout: "md:grid-cols-[minmax(0,1fr)_228px]"},
      floating: {layout: "mx-auto max-w-3xl grid-cols-1"},
    },
  },
  defaultVariants: {presentation: "sidebar"},
});

const sections = [
  {
    id: "overview",
    depth: 2,
    title: "概览",
    text: "好的内容导航，让读者随时知道自己在哪里。从一篇入门指南到完整的产品文档，目录连接的不只是标题，也是阅读的节奏。",
    detail:
      "正文保持舒适的阅读宽度，目录安静地停留在一侧。随着内容向下展开，一小段高亮标记当前位置，让视线能够自然地在正文与目录之间切换。",
  },
  {
    id: "hierarchy",
    depth: 2,
    title: "组织内容层级",
    text: "先搭建文章的骨架，再补充细节。一级章节承载主题，子章节解释步骤；清晰的层级比更复杂的视觉装饰更有帮助。",
    detail:
      "左侧轨道会在进入子章节时向内折进，回到主章节时向外折回。即使暂时不阅读目录文字，也能感受到内容结构的变化。",
  },
  {
    id: "headings",
    depth: 3,
    title: "标题与锚点",
    text: "每个标题都有稳定的锚点。点击目录可以直达对应章节，也可以继续滚动，目录会重新跟随当前阅读的位置。",
    detail:
      "跳转后为标题保留足够的顶部空间，避免文字紧贴阅读区域边缘。键盘用户同样可以通过 Tab 和 Enter 使用这些链接。",
  },
  {
    id: "nested",
    depth: 4,
    title: "更深一层的内容",
    text: "当一个步骤需要进一步展开时，可以使用第三级目录。轨道随缩进再向内移动，连续的折线让父子关系依然清晰。",
    detail:
      "不必为了视觉效果增加标题层级。只在内容确实需要拆分时使用更深的章节，让导航始终服务于理解。",
  },
  {
    id: "long-title",
    depth: 3,
    title: "当中文标题比较长时，让换行与轨道依然自然对齐",
    text: "真实文档中的标题不总是短短几个字。窄一些的目录、稍大的字体，或更长的中文标题，都可能让一项目录占据两行。",
    detail:
      "这里保留完整标题。轨道根据实际排版高度绘制，高亮段也覆盖当前目录项的完整高度，让换行后的结构依然准确。",
  },
  {
    id: "reading",
    depth: 2,
    title: "跟随阅读位置",
    text: "向下滚动时，高亮标记会移动到新的章节；向上返回时，它也会沿着相同的轨道回到前面的内容。",
    detail:
      "轨道本身保持稳定，主题色只在当前章节对应的区域显现。柔和的过渡帮助读者感知位置变化，又不会打断阅读。",
  },
  {
    id: "variants",
    depth: 3,
    title: "选择轨道样式",
    text: "Straight 更克制，适合结构简单的短文章。Circuit 用折线表达层级，适合有多个子章节的指南与参考文档。",
    detail:
      "试着切换右上角的样式。文章位置与当前章节保持不变，只有轨道的表达方式发生变化，可以直接比较两种视觉效果。",
  },
  {
    id: "motion",
    depth: 3,
    title: "动效与可访问性",
    text: "高亮的位置变化使用短暂的缓动，链接本身仍保留清晰的键盘焦点。当前目录项除了颜色变化，也会加重文字。",
    detail:
      "如果系统开启了减少动态效果，轨道高亮会直接更新位置，章节跳转也会取消平滑滚动，保留完整的导航能力。",
  },
  {
    id: "next",
    depth: 2,
    title: "开始下一段阅读",
    text: "一条细线就能连接整篇文章。让目录表达结构，让高亮提示位置，把更多注意力留给内容本身。",
    detail:
      "你已经来到文章的最后一节。可以点击目录回到概览，或切换另一种轨道样式，重新感受完整的阅读过程。",
  },
] satisfies {id: string; depth: 2 | 3 | 4; title: string; text: string; detail: string}[];

function ContentTocPreview({
  initialPresentation = "sidebar",
  initialVariant = "circuit",
}: {
  initialPresentation?: ContentTocProps["presentation"];
  initialVariant?: ContentTocProps["variant"];
}) {
  const [variant, setVariant] = useState(initialVariant);
  const [presentation, setPresentation] = useState(initialPresentation);
  const [active, setActive] = useState(0);
  const readerRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const previousPresentation = useRef(presentation);
  const prefix = useId();
  const styles = demo({presentation});
  const items = useMemo(
    () => sections.map(({depth, id, title}) => ({depth, id: `${prefix}-${id}`, title})),
    [prefix],
  );

  useLayoutEffect(() => {
    if (previousPresentation.current === presentation) return;
    previousPresentation.current = presentation;
    const reader = readerRef.current;
    const heading = articleRef.current?.querySelectorAll<HTMLElement>("[data-toc-heading]")[active];

    if (reader && heading) {
      reader.scrollTop +=
        heading.getBoundingClientRect().top - reader.getBoundingClientRect().top - 60;
    }
  }, [presentation, active]);

  useEffect(() => {
    const reader = readerRef.current;
    const article = articleRef.current;

    if (!reader || !article) return;
    let frame = 0;

    const update = () => {
      const threshold = reader.getBoundingClientRect().top + 80;
      const headings = Array.from(article.querySelectorAll<HTMLElement>("[data-toc-heading]"));
      let index = 0;

      headings.forEach((heading, i) => {
        if (heading.getBoundingClientRect().top <= threshold) index = i;
      });
      if (reader.scrollTop + reader.clientHeight >= reader.scrollHeight - 2)
        index = sections.length - 1;
      setActive(index);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);

    observer.observe(article);
    observer.observe(reader);
    reader.addEventListener("scroll", schedule, {passive: true});
    update();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      reader.removeEventListener("scroll", schedule);
    };
  }, []);

  function navigate(id: string) {
    const reader = readerRef.current;
    const heading = document.getElementById(id);

    if (!reader || !heading || !articleRef.current?.contains(heading)) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    reader.scrollTo({
      behavior: reducedMotion ? "instant" : "smooth",
      top:
        reader.scrollTop +
        heading.getBoundingClientRect().top -
        reader.getBoundingClientRect().top -
        60,
    });
    heading.focus({preventScroll: true});
  }

  const toc = (
    <ContentToc
      activeId={items[active]!.id}
      className={presentation === "sidebar" ? styles.aside() : styles.floating()}
      items={items}
      label="本页目录"
      presentation={presentation}
      variant={variant}
      onNavigate={navigate}
    >
      <ContentToc.Title />
      <ContentToc.List className={presentation === "sidebar" ? styles.asideList() : undefined} />
    </ContentToc>
  );

  return (
    <div className={styles.canvas()}>
      <div className={styles.frame()}>
        <header className={styles.toolbar()}>
          <div className={styles.identity()}>
            <span className={styles.monogram()}>SY</span>
            <div>
              <p className={styles.toolbarTitle()}>Content TOC</p>
              <p className={styles.eyebrow()}>内容导航 · 交互预览</p>
            </div>
          </div>
          <div className={styles.controls()}>
            <div>
              <span className={styles.controlLabel()}>展示方式</span>
              <ToggleButtonGroup
                disallowEmptySelection
                aria-label="展示方式"
                selectedKeys={[presentation]}
                selectionMode="single"
                size="sm"
                onSelectionChange={(keys) => {
                  const value = [...keys][0];

                  if (value === "sidebar" || value === "floating") setPresentation(value);
                }}
              >
                <ToggleButton id="sidebar">侧边常驻</ToggleButton>
                <ToggleButton id="floating">浮动展开</ToggleButton>
              </ToggleButtonGroup>
            </div>
            <div>
              <span className={styles.controlLabel()}>轨道样式</span>
              <ToggleButtonGroup
                disallowEmptySelection
                aria-label="轨道样式"
                selectedKeys={[variant]}
                selectionMode="single"
                size="sm"
                onSelectionChange={(keys) => {
                  const value = [...keys][0];

                  if (value === "straight" || value === "circuit") setVariant(value);
                }}
              >
                <ToggleButton id="straight">Straight</ToggleButton>
                <ToggleButton id="circuit">Circuit</ToggleButton>
              </ToggleButtonGroup>
            </div>
          </div>
        </header>

        <div
          ref={readerRef}
          aria-label="文章阅读区域"
          className={styles.reader()}
          role="region"
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Enables keyboard scrolling of the reading region.
          tabIndex={0}
        >
          <div className={styles.layout()}>
            <article ref={articleRef} className={styles.article()}>
              <header className={styles.articleHeader()}>
                <p className={styles.breadcrumb()}>设计指南 / 内容导航</p>
                <h1 className={styles.title()}>让目录跟上阅读。</h1>
                <p className={styles.lead()}>
                  用一条连续的轨道，串起文章的结构与阅读的位置。向下滚动，看看目录如何随内容自然流动。
                </p>
                <div className={styles.meta()}>
                  <span>SY INC Design</span>
                  <span className={styles.dot()} />
                  <span>约 4 分钟</span>
                </div>
              </header>
              {sections.map((section, index) => {
                const Heading = section.depth === 2 ? "h2" : section.depth === 3 ? "h3" : "h4";

                return (
                  <section key={section.id} className={styles.section()}>
                    <Heading
                      data-toc-heading
                      className={demo({depth: section.depth}).heading()}
                      id={`${prefix}-${section.id}`}
                      tabIndex={-1}
                    >
                      {section.title}
                    </Heading>
                    <p className={styles.paragraph()}>{section.text}</p>
                    <p className={styles.paragraph()}>{section.detail}</p>
                    {index === 0 && (
                      <aside className={styles.callout()}>
                        <span className={styles.calloutLabel()}>试试看</span>
                        滚动正文，或打开目录跳转到任意章节。进入子章节时，留意轨道如何折进，再回到主线。
                      </aside>
                    )}
                    {section.id === "hierarchy" && (
                      <pre className={styles.example()}>
                        {
                          "H2  组织内容层级\n  H3  标题与锚点\n    H4  更深一层的内容\n  H3  长标题与换行"
                        }
                      </pre>
                    )}
                  </section>
                );
              })}
            </article>

            {presentation === "sidebar" && toc}
          </div>
        </div>
        {presentation === "floating" && toc}
        <footer className={styles.footer()}>
          <span className={styles.status()}>
            <span className={styles.statusDot()} />
            {sections[active]!.title}
          </span>
          <span>
            {String(active + 1).padStart(2, "0")} / {String(sections.length).padStart(2, "0")}
          </span>
        </footer>
      </div>
    </div>
  );
}

const formSections = [
  {depth: 2, id: "basics", title: "基本信息"},
  {depth: 2, id: "rules", title: "优惠规则"},
  {depth: 3, id: "threshold", title: "门槛与叠加"},
  {depth: 2, id: "schedule", title: "活动时间"},
] satisfies ContentTocProps["items"];

function FormOutlinePreview() {
  const [active, setActive] = useState("basics");
  const [invalid, setInvalid] = useState(new Set(["rules", "schedule"]));

  return (
    <div className="flex items-start gap-10 p-8">
      <ContentToc
        activeId={active}
        className="w-56"
        items={formSections}
        label="表单目录"
        onNavigate={setActive}
      >
        <ContentToc.Title />
        <ContentToc.List>
          {(item) => (
            <ContentToc.Item>
              <span className="min-w-0 flex-1">{item.title}</span>
              {invalid.has(item.id) && (
                <span aria-label="有错误" className="size-1.5 shrink-0 rounded-full bg-danger" />
              )}
            </ContentToc.Item>
          )}
        </ContentToc.List>
      </ContentToc>
      <Button variant="secondary" onPress={() => setInvalid(new Set())}>
        修正全部错误
      </Button>
    </div>
  );
}

const meta = {
  title: "Components/ContentToc",
  component: ContentToc,
  args: {items: [], label: ""},
  parameters: {layout: "fullscreen"},
} satisfies Meta<typeof ContentToc>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Circuit: Story = {
  render: () => <ContentTocPreview initialVariant="circuit" />,
};
export const Straight: Story = {
  render: () => <ContentTocPreview initialVariant="straight" />,
};
export const Floating: Story = {
  render: () => <ContentTocPreview initialPresentation="floating" />,
};
export const WithStatusMarkers: Story = {
  render: () => <FormOutlinePreview />,
};
