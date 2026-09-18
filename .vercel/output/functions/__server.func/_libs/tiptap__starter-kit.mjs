import { Extension } from "./@tiptap/core+[...].mjs";
import { Blockquote } from "./tiptap__extension-blockquote.mjs";
import { Bold } from "./tiptap__extension-bold.mjs";
import { Code } from "./tiptap__extension-code.mjs";
import { CodeBlock } from "./tiptap__extension-code-block.mjs";
import { Document } from "./tiptap__extension-document.mjs";
import { HardBreak } from "./tiptap__extension-hard-break.mjs";
import { Heading } from "./tiptap__extension-heading.mjs";
import { HorizontalRule } from "./@tiptap/extension-horizontal-rule+[...].mjs";
import { Italic } from "./tiptap__extension-italic.mjs";
import { Link } from "./@tiptap/extension-link+[...].mjs";
import { BulletList, ListItem, ListKeymap, OrderedList } from "./tiptap__extension-list.mjs";
import { Paragraph } from "./tiptap__extension-paragraph.mjs";
import { Strike } from "./tiptap__extension-strike.mjs";
import { Text } from "./tiptap__extension-text.mjs";
import { Underline } from "./tiptap__extension-underline.mjs";
import { Dropcursor, Gapcursor, TrailingNode, UndoRedo } from "./@tiptap/extension-placeholder+[...].mjs";
var src_default = Extension.create({
	name: "starterKit",
	addExtensions() {
		const extensions = [];
		if (this.options.bold !== false) extensions.push(Bold.configure(this.options.bold));
		if (this.options.blockquote !== false) extensions.push(Blockquote.configure(this.options.blockquote));
		if (this.options.bulletList !== false) extensions.push(BulletList.configure(this.options.bulletList));
		if (this.options.code !== false) extensions.push(Code.configure(this.options.code));
		if (this.options.codeBlock !== false) extensions.push(CodeBlock.configure(this.options.codeBlock));
		if (this.options.document !== false) extensions.push(Document.configure(this.options.document));
		if (this.options.dropcursor !== false) extensions.push(Dropcursor.configure(this.options.dropcursor));
		if (this.options.gapcursor !== false) extensions.push(Gapcursor.configure(this.options.gapcursor));
		if (this.options.hardBreak !== false) extensions.push(HardBreak.configure(this.options.hardBreak));
		if (this.options.heading !== false) extensions.push(Heading.configure(this.options.heading));
		if (this.options.undoRedo !== false) extensions.push(UndoRedo.configure(this.options.undoRedo));
		if (this.options.horizontalRule !== false) extensions.push(HorizontalRule.configure(this.options.horizontalRule));
		if (this.options.italic !== false) extensions.push(Italic.configure(this.options.italic));
		if (this.options.listItem !== false) extensions.push(ListItem.configure(this.options.listItem));
		if (this.options.listKeymap !== false) {
			var _this$options;
			extensions.push(ListKeymap.configure((_this$options = this.options) === null || _this$options === void 0 ? void 0 : _this$options.listKeymap));
		}
		if (this.options.link !== false) {
			var _this$options2;
			extensions.push(Link.configure((_this$options2 = this.options) === null || _this$options2 === void 0 ? void 0 : _this$options2.link));
		}
		if (this.options.orderedList !== false) extensions.push(OrderedList.configure(this.options.orderedList));
		if (this.options.paragraph !== false) extensions.push(Paragraph.configure(this.options.paragraph));
		if (this.options.strike !== false) extensions.push(Strike.configure(this.options.strike));
		if (this.options.text !== false) extensions.push(Text.configure(this.options.text));
		if (this.options.underline !== false) {
			var _this$options3;
			extensions.push(Underline.configure((_this$options3 = this.options) === null || _this$options3 === void 0 ? void 0 : _this$options3.underline));
		}
		if (this.options.trailingNode !== false) {
			var _this$options4;
			extensions.push(TrailingNode.configure((_this$options4 = this.options) === null || _this$options4 === void 0 ? void 0 : _this$options4.trailingNode));
		}
		return extensions;
	}
});
//#endregion
export { src_default };
