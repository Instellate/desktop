import { useCallback, useEffect, useRef } from 'react';
import { defaultGateway, MessageListener } from './store/gateway';

export function useGateway(listener: MessageListener, channelId: string) {
  useEffect(() => {
    defaultGateway.addMessageListener((type, data) => {
      if (data.channelId === channelId) {
        listener(type, data);
      }
      return () => {
        defaultGateway.removeEventListener();
      };
    });
  }, [channelId, listener]);
}

import { createContext, useContext } from 'react';
import SimpleMarkdown, {
  ParserRules,
  ReactRules,
  SingleASTNode,
} from '@khanacademy/simple-markdown';
import React from 'react';
import { Mention } from './components/Mention';
import { jsx } from 'react/jsx-runtime';

export type MenuComponentValue = {
  node: React.ReactNode | React.ReactNode[];
  x: number;
  y: number;
};

export type MenuComponentType = {
  value?: MenuComponentValue;
  setValue?: (n: MenuComponentValue | undefined) => void;
};

export const MenuComponentContext = createContext<MenuComponentType>({});

export function useContextMenu(node: React.ReactNode | React.ReactNode[]) {
  const { setValue } = useContext(MenuComponentContext);

  return {
    onContextMenu: useCallback(
      (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        setValue!({ node, x: e.clientX, y: e.clientY });
        e.preventDefault();
      },
      [node, setValue],
    ),
  };
}

export type ModalContextType = {
  value?: React.ReactNode | React.ReactNode[] | undefined;
  setValue: (_: React.ReactNode | React.ReactNode[] | undefined) => void;
};

export const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
  const { setValue } = useContext(ModalContext)!;

  return useCallback(
    (node: React.ReactNode | React.ReactNode[] | undefined) => {
      if (node === undefined) {
        setValue(undefined);
      } else {
        setTimeout(() => setValue(node));
      }
    },
    [setValue],
  );
}

const defaultRules = SimpleMarkdown.defaultRules;

export function useMarkdownRules() {
  const refRules = useRef<ReactRules & ParserRules>({
    mentions: {
      order: SimpleMarkdown.defaultRules.text.order,

      match: (source) => {
        return /^<@([a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12})>/.exec(
          source,
        );
      },

      parse: (capture) => {
        return {
          content: capture[1],
        };
      },

      react: (node: SingleASTNode, _output, state) => {
        const content: string = node.content;
        return jsx(Mention, { id: content }, state.key);
      },
    },
    linkref: {
      order: SimpleMarkdown.defaultRules.link.order,
      match: SimpleMarkdown.defaultRules.link.match,
      parse: SimpleMarkdown.defaultRules.link.parse,

      react: (node, parse, state) => {
        return React.createElement('a', {
          children: parse(node.content, state),
          target: '_blank',
          href: node.target,
          className: 'text-cyan-400 hover:underline',
          key: state.key,
        });
      },
    },
    link: {
      order: SimpleMarkdown.defaultRules.link.order,

      match: (source) => {
        return /^https?:\/\/(?:[a-z_\-A-Z0-9]+?\.)*[a-zAZ0-9\-_]{1,256}\.[-a-zA-Z0-9]{1,24}\/?[#a-zA-Z0-9%&?=\-/_.]*/.exec(
          source,
        );
      },

      parse: (capture) => {
        return {
          content: capture[0],
        };
      },

      react: (node, _output, state) => {
        return React.createElement('a', {
          children: node.content,
          href: node.content,
          target: '_blank',
          className: 'text-cyan-400 hover:underline',
          key: state.key,
        });
      },
    },
  });

  const { heading, em, strong, u, text, paragraph, br, newline } = defaultRules;

  return {
    heading,
    em,
    strong,
    u,
    text,
    paragraph,
    br,
    newline,
    ...refRules.current,
  };
}
