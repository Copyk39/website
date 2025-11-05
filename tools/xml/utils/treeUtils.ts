import type { XmlNode } from '../types';

export const findNodeById = (node: XmlNode, id: string): XmlNode | null => {
  if (node.id === id) {
    return node;
  }
  for (const child of node.children) {
    const found = findNodeById(child, id);
    if (found) {
      return found;
    }
  }
  return null;
};

export const updateNodeInTree = (root: XmlNode, updatedNode: XmlNode): XmlNode | null => {
  // Create a deep copy to ensure immutability
  const newRoot = JSON.parse(JSON.stringify(root));

  const findAndUpdate = (node: XmlNode): boolean => {
    if (node.id === updatedNode.id) {
      // This is not a proper way to update, as it replaces children too.
      // We need to merge properties, not replace the whole object.
      // This is a complex problem. A simpler approach for now is to find parent and replace child.
      return true; // Found, but not replacing yet
    }
    for (let i = 0; i < node.children.length; i++) {
        if (node.children[i].id === updatedNode.id) {
            node.children[i] = updatedNode;
            return true;
        }
        if (findAndUpdate(node.children[i])) {
            return true;
        }
    }
    return false;
  };

  // Handle root case
  if (newRoot.id === updatedNode.id) {
      return updatedNode;
  }

  if (findAndUpdate(newRoot)) {
    return newRoot;
  }
  return root; // Return original if not found
};

export const getNodeName = (node: XmlNode): string => {
    if (node.attributes.class) { // It's an instance
        const propertiesNode = node.children.find(c => c.tag === 'Properties');
        if (propertiesNode) {
            const nameNode = propertiesNode.children.find(p => p.attributes.name === 'Name' && p.tag === 'string');
            if (nameNode && nameNode.textContent) {
                return nameNode.textContent;
            }
        }
        return node.attributes.class; // fallback to class name
    }
    if(node.attributes.name) return node.attributes.name; // For properties
    return node.tag;
};
