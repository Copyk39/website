
import React, { useState } from 'react';
import type { XmlNode } from '../types';
import TreeNode from './TreeNode';
import { Search } from 'lucide-react';

interface HierarchyTreeProps {
  node: XmlNode;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}

const HierarchyTree: React.FC<HierarchyTreeProps> = ({ node, selectedNodeId, onSelectNode }) => {
  const [filter, setFilter] = useState('');

  const filterTree = (node: XmlNode, filterText: string): XmlNode | null => {
    if (!filterText) return node;

    const lowerCaseFilter = filterText.toLowerCase();
    const nodeName = node.attributes.Name || node.tag;
    const matches = nodeName.toLowerCase().includes(lowerCaseFilter);

    const filteredChildren = node.children.map(child => filterTree(child, filterText)).filter(Boolean) as XmlNode[];

    if (matches || filteredChildren.length > 0) {
      return { ...node, children: filteredChildren };
    }

    return null;
  };
  
  const filteredNode = filterTree(node, filter);

  return (
    <div className="flex flex-col h-full bg-slate-800 text-slate-300">
      <div className="p-2 border-b border-slate-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Search & filter..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md py-1.5 pl-8 pr-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        </div>
      </div>
      <div className="flex-grow overflow-auto p-2">
        {filteredNode ? (
            <TreeNode
              node={filteredNode}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              isInitiallyOpen={true}
              filter={filter}
            />
        ) : (
             <p className="p-4 text-slate-500 text-center">No items match your filter.</p>
        )}
      </div>
    </div>
  );
};

export default HierarchyTree;
