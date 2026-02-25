import { parseMessageContent, formatInlineText } from '../utils/messageParser';

/**
 * Renders structured message content with proper formatting
 * Handles headings, lists, paragraphs, code blocks, etc.
 */
export function MessageContent({ content }) {
  const elements = parseMessageContent(content);

  return (
    <div className="space-y-2">
      {elements.map((element, idx) => {
        switch (element.type) {
          case 'heading': {
            const headingClasses = {
              1: 'text-lg font-bold mt-3 mb-2',
              2: 'text-base font-bold mt-2 mb-2',
              3: 'text-sm font-semibold mt-1 mb-1'
            };
            return (
              <div key={idx} className={headingClasses[element.level]}>
                {element.content}
              </div>
            );
          }

          case 'paragraph':
            return (
              <p
                key={idx}
                className="text-sm leading-relaxed whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{
                  __html: formatInlineText(element.content)
                }}
              />
            );

          case 'list':
            return (
              <ul key={idx} className="list-disc list-inside space-y-1 text-sm">
                {element.items.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    className="ml-2"
                    dangerouslySetInnerHTML={{
                      __html: formatInlineText(item)
                    }}
                  />
                ))}
              </ul>
            );

          case 'numberedList':
            return (
              <ol key={idx} className="list-decimal list-inside space-y-1 text-sm">
                {element.items.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    className="ml-2"
                    dangerouslySetInnerHTML={{
                      __html: formatInlineText(item)
                    }}
                  />
                ))}
              </ol>
            );

          case 'code':
            return (
              <pre
                key={idx}
                className="bg-slate-100 p-3 rounded text-xs font-mono overflow-x-auto text-slate-900"
              >
                <code>{element.content}</code>
              </pre>
            );

          case 'spacer':
            return <div key={idx} className="h-2" />;

          default:
            return null;
        }
      })}
    </div>
  );
}
