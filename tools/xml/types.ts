
export interface XmlNode {
  id: string;
  tag: string;
  attributes: Record<string, string>;
  children: XmlNode[];
  textContent?: string;
}
