import { createEditor, Editor, Element, Node, NodeEntry, Range, Transforms } from 'slate';
import { Slate, Editable, withReact, RenderLeafProps, RenderElementProps } from 'slate-react';
import { withHistory } from 'slate-history';
import { useCallback, useState } from 'react';
import { cn } from '@udecode/cn';

type Props = {
  channel: string;
  sendMessage: (content: string) => void;
};

const initialValue = [
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: '',
      },
    ],
  },
];

interface Decoration extends Range {
  bold?: true;
  underline?: true;
  header?: 'h1' | 'h2' | 'h3';
  strikethrough?: true;
  link?: true;
  italic?: true;
}

export default function MessageInput({ channel, sendMessage }: Props) {
  const value = '';
  const [editor] = useState(() => withReact(withHistory(createEditor())));

  const renderLeaf = useCallback(({ attributes, children, leaf }: RenderLeafProps) => {
    let size: string = '';
    switch (leaf.header) {
      case 'h1':
        size = ' text-xl font-bold';
        break;
      case 'h2':
        size = ' text-lg font-bold';
        break;
      case 'h3':
        size = ' text-lg';
        break;
      default:
        break;
    }

    return (
      <span
        {...attributes}
        className={cn(
          {
            underline: leaf.underline,
            'font-bold': leaf.bold,
            'line-through': leaf.strikethrough,
            'text-cyan-400': leaf.link,
            italic: leaf.italic,
          },
          size,
        )}
      >
        {children}
      </span>
    );
  }, []);

  const renderElement = useCallback(
    ({ attributes, children, element }: RenderElementProps) => {
      const Tag = Editor.isInline(editor, element) ? 'span' : 'p';
      return <Tag {...attributes}>{children}</Tag>;
    },
    [editor], // TODO: Implement mentions somehow? 
  );

  const decorate = useCallback((entry: NodeEntry) => {
    const [node, path] = entry;

    if (Element.isElement(node)) {
      const range: Decoration[] = [];

      for (let i = 0; i < node.children.length; i++) {
        const text = Node.string(node.children[i]);
        const wholeString: Decoration = {
          anchor: {
            path,
            offset: 0,
          },
          focus: {
            path,
            offset: text.length,
          },
        };

        if (text.startsWith('### ')) {
          wholeString.header = 'h3';
        } else if (text.startsWith('## ')) {
          wholeString.header = 'h2';
        } else if (text.startsWith('# ')) {
          wholeString.header = 'h1';
        }

        range.push(wholeString);

        let match;

        const boldRegex = /(?<!\\)\*\*(.+?)(?<!\\)\*\*/gm;
        while ((match = boldRegex.exec(text)) !== null) {
          const anchor = { path, offset: match.index + 2 };
          const focus = { path, offset: match.index + match[0].length - 2 };

          range.push({
            anchor,
            focus,
            bold: true,
          });
        }

        const underlineRegex = /(?<!\\)__(.+?)(?<!\\)__/gm;
        while ((match = underlineRegex.exec(text)) !== null) {
          const anchor = { path, offset: match.index + 2 };
          const focus = { path, offset: match.index + match[0].length - 2 };

          range.push({
            anchor,
            focus,
            underline: true,
          });
        }

        const strikethroughRegex = /~~(.+?)~~/gm;
        while ((match = strikethroughRegex.exec(text)) !== null) {
          const anchor = { path, offset: match.index + 2 };
          const focus = { path, offset: match.index + match[0].length - 2 };

          range.push({
            anchor,
            focus,
            strikethrough: true,
          });
        }

        const linkRegex =
          /https?:\/\/(?:[a-z_\-A-Z0-9]+?\.)*[a-zAZ0-9\-_]{1,256}\.[-a-zA-Z0-9]{1,24}\/?[#a-zA-Z0-9%&?=\-/_.]*/gm;
        while ((match = linkRegex.exec(text)) !== null) {
          const anchor = { path, offset: match.index };
          const focus = { path, offset: match.index + match[0].length };

          range.push({
            anchor,
            focus,
            link: true,
          });
        }

        const italicRegex =
          /_((?:__|\\[\s\S]|[^\\_])+?)_|(?<=\s|^)\*(?=\S)((?:\*\*|\\[\s\S]|\s+(?:\\[\s\S]|[^\s*\\]|\*\*)|[^\s*\\])+?)\*(?!\*)/gm;
        while ((match = italicRegex.exec(text)) !== null) {
          const anchor = { path, offset: match.index +1 };
          const focus = { path, offset: match.index + match[0].length - 1};

          range.push({
            anchor,
            focus,
            italic: true,
          });
        }

        return range;
      }
    }

    return [];
  }, []);

  return (
    <>
      <Slate editor={editor} initialValue={initialValue}>
        <Editable
          className="w-full overflow-y-auto overflow-x-hidden rounded-md bg-inherit bg-neutral-700 p-2 outline-none"
          rows={0}
          placeholder={`Message ${channel}...`}
          value={value}
          renderLeaf={renderLeaf}
          renderElement={renderElement}
          decorate={decorate}
          renderPlaceholder={({ children, attributes }) => (
            <span
              {...attributes}
              className="pointer-events-none absolute w-full max-w-full select-none opacity-35"
              style={{}}
            >
              <span>{children}</span>
            </span>
          )}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              const content = editor.children.map((n) => Node.string(n)).join('\n');
              Transforms.delete(editor, {
                at: {
                  anchor: Editor.start(editor, []),
                  focus: Editor.end(editor, []),
                },
              });
              sendMessage(content);
            }
          }}
        />
      </Slate>
    </>
  );
}
