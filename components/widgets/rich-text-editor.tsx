"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";

interface TextMark {
  type: "bold" | "italic" | "underline" | "code";
}

interface TextNode {
  type: "text";
  text: string;
  marks?: TextMark[];
}

interface ContentNode {
  type:
    | "paragraph"
    | "heading"
    | "bulletList"
    | "orderedList"
    | "listItem"
    | "blockquote";
  content?: (TextNode | ContentNode)[];
  attrs?: { level?: number };
}

type Node = TextNode | ContentNode;

interface RichTextContent {
  type: "doc";
  content: (TextNode | ContentNode)[];
}

interface RichTextEditorProps {
  content: RichTextContent;
  onChange: (content: RichTextContent, plainText: string) => void;
}

export default function RichTextEditor({
  content,
  onChange,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && content) {
      // Simple rich text implementation
      // In a real app, you'd use a library like TipTap, Slate, or Draft.js
      const plainText = extractPlainText(content);
      if (editorRef.current.textContent !== plainText) {
        editorRef.current.innerHTML = convertToHTML(content);
      }
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      const plainText = editorRef.current.textContent || "";
      const htmlContent = editorRef.current.innerHTML;

      // Convert HTML back to our content format
      const newContent = convertFromHTML(htmlContent);
      onChange(newContent, plainText);
    }
  };

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const extractPlainText = (content: RichTextContent): string => {
    if (!content || !content.content) return "";

    let text = "";
    const traverse = (node: Node) => {
      if (node.type === "text") {
        text += node.text || "";
      } else if (node.content) {
        node.content.forEach(traverse);
      }
      if (node.type === "paragraph" || node.type === "heading") {
        text += "\n";
      }
    };

    content.content.forEach(traverse);
    return text.trim();
  };

  const convertToHTML = (content: RichTextContent): string => {
    if (!content || !content.content) return "";

    let html = "";
    const traverse = (node: Node) => {
      switch (node.type) {
        case "paragraph":
          html += "<p>";
          if (node.content) node.content.forEach(traverse);
          html += "</p>";
          break;
        case "heading":
          const level = node.attrs?.level || 1;
          html += `<h${level}>`;
          if (node.content) node.content.forEach(traverse);
          html += `</h${level}>`;
          break;
        case "text":
          let text = node.text || "";
          if (node.marks) {
            node.marks.forEach((mark: TextMark) => {
              switch (mark.type) {
                case "bold":
                  text = `<strong>${text}</strong>`;
                  break;
                case "italic":
                  text = `<em>${text}</em>`;
                  break;
                case "underline":
                  text = `<u>${text}</u>`;
                  break;
                case "code":
                  text = `<code>${text}</code>`;
                  break;
              }
            });
          }
          html += text;
          break;
        case "bulletList":
          html += "<ul>";
          if (node.content) node.content.forEach(traverse);
          html += "</ul>";
          break;
        case "orderedList":
          html += "<ol>";
          if (node.content) node.content.forEach(traverse);
          html += "</ol>";
          break;
        case "listItem":
          html += "<li>";
          if (node.content) node.content.forEach(traverse);
          html += "</li>";
          break;
        case "blockquote":
          html += "<blockquote>";
          if (node.content) node.content.forEach(traverse);
          html += "</blockquote>";
          break;
        default:
          // Handle any other node types that might have content
          const contentNode = node as ContentNode;
          if (contentNode.content) {
            contentNode.content.forEach(traverse);
          }
      }
    };

    content.content.forEach(traverse);
    return html;
  };

  const convertFromHTML = (html: string): RichTextContent => {
    // Simple conversion - in a real app, you'd use a proper parser
    return {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: html.replace(/<[^>]*>/g, ""), // Strip HTML tags for now
            },
          ],
        },
      ],
    };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-slate-700 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => applyFormat("bold")}
          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => applyFormat("italic")}
          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => applyFormat("underline")}
          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-slate-600 mx-2" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => applyFormat("formatBlock", "h1")}
          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => applyFormat("formatBlock", "h2")}
          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => applyFormat("formatBlock", "h3")}
          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-slate-600 mx-2" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => applyFormat("insertUnorderedList")}
          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => applyFormat("insertOrderedList")}
          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => applyFormat("formatBlock", "blockquote")}
          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => applyFormat("formatBlock", "pre")}
          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="flex-1 p-4 text-white bg-slate-900/30 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 overflow-y-auto"
        style={{
          minHeight: "300px",
          lineHeight: "1.6",
        }}
        suppressContentEditableWarning={true}
      />
    </div>
  );
}
