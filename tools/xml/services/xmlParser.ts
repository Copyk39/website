
import type { XmlNode } from '../types';

const convertNode = (domNode: Element): XmlNode => {
  const attributes: Record<string, string> = {};
  for (const attr of Array.from(domNode.attributes)) {
    attributes[attr.name] = attr.value;
  }

  const children: XmlNode[] = [];
  let textContent: string | undefined = undefined;

  if (domNode.childNodes.length > 0) {
    let textParts: string[] = [];
    let hasElementChildren = false;
    domNode.childNodes.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
            hasElementChildren = true;
            children.push(convertNode(child as Element));
        } else if (child.nodeType === Node.TEXT_NODE || child.nodeType === Node.CDATA_SECTION_NODE) {
            const trimmedText = child.textContent?.trim();
            if (trimmedText) {
                textParts.push(trimmedText);
            }
        }
    });
    if (textParts.length > 0 && !hasElementChildren) {
        textContent = textParts.join('');
    } else if (textParts.length > 0 && hasElementChildren) {
      // Handle mixed content if necessary, for now we prioritize element children
      // and might lose some text nodes if they are mixed with elements.
      // This logic can be adjusted based on rbxlx format specifics.
    }
  }

  return {
    id: crypto.randomUUID(),
    tag: domNode.tagName,
    attributes,
    children,
    textContent,
  };
};

export const parseXml = (xmlString: string): XmlNode | null => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');
  
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error(`XML Parsing Error: ${parseError.textContent || 'Unknown error'}`);
  }
  
  if (doc.documentElement) {
    return convertNode(doc.documentElement);
  }
  return null;
};

const buildNode = (xmlNode: XmlNode, doc: XMLDocument): Element => {
  const element = doc.createElement(xmlNode.tag);

  for (const [key, value] of Object.entries(xmlNode.attributes)) {
    element.setAttribute(key, value);
  }

  if (xmlNode.textContent) {
      // Use CDATA for script content to avoid issues with special characters
    if (xmlNode.attributes.Name === 'Source' || xmlNode.tag === 'ProtectedString') {
        element.appendChild(doc.createCDATASection(xmlNode.textContent));
    } else {
        element.textContent = xmlNode.textContent;
    }
  }

  for (const childNode of xmlNode.children) {
    element.appendChild(buildNode(childNode, doc));
  }

  return element;
};

export const serializeXml = (node: XmlNode): string => {
  const doc = document.implementation.createDocument(null, null, null);
  const rootElement = buildNode(node, doc);
  doc.appendChild(rootElement);

  const serializer = new XMLSerializer();
  const xmlString = serializer.serializeToString(doc);

  // Basic pretty printing
  return formatXml(xmlString);
};


function formatXml(xml: string) {
    const PADDING = '  ';
    const reg = /(>)(<)(\/*)/g;
    let pad = 0;

    xml = xml.replace(reg, '$1\r\n$2$3');

    return xml.split('\r\n').map((node, index) => {
        let indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (node.match(/^<\/\w/)) {
            if (pad !== 0) {
                pad -= 1;
            }
        } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
            indent = 1;
        } else {
            indent = 0;
        }

        const padding = Array(pad + 1).join(PADDING);
        pad += indent;

        return padding + node;
    }).join('\r\n');
}
