import React, { useState } from 'react';
import type { XmlNode } from '../types';
import { ChevronRight, ChevronDown, File, Folder, FileCode, Puzzle, Component } from 'lucide-react';
import { getNodeName } from '../utils/treeUtils';

interface TreeNodeProps {
  node: XmlNode;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  isInitiallyOpen?: boolean;
  filter?: string;
}

const getIcon = (node: XmlNode) => {
    const className = node.attributes.class || '';
    if (className.toLowerCase().includes('script')) return <FileCode className="w-4 h-4 text-sky-400" />;
    if (className === 'Folder' || node.tag === 'Folder') return <Folder className="w-4 h-4 text-amber-400" />;
    if (className === 'Part' || className === 'SpawnLocation') return <Puzzle className="w-4 h-4 text-fuchsia-400" />;
    if (className) return <Component className="w-4 h-4 text-rose-400" />;
    return <File className="w-4 h-4 text-slate-500" />;
};

const TreeNode: React.FC<TreeNodeProps> = ({ node, selectedNodeId, onSelectNode, isInitiallyOpen = false, filter = '' }) => {
  const [isExpanded, setIsExpanded] = useState(isInitiallyOpen || !!filter);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleSelect = () => {
    onSelectNode(node.id);
  };

  const isSelected = node.id === selectedNodeId;
  const hasChildren = node.children && node.children.length > 0;
  const nodeName = getNodeName(node);

  return (
    <div>
      <div
        onClick={handleSelect}
        className={`flex items-center p-1 rounded-md cursor-pointer ${
          isSelected ? 'bg-cyan-600/50 text-white' : 'hover:bg-slate-700/50'
        }`}
      >
        <div onClick={hasChildren ? handleToggle : undefined} className="w-5 flex-shrink-0">
         {hasChildren && (
            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
         )}
        </div>
        <div className="mr-2 flex-shrink-0">{getIcon(node)}</div>
        <span className="truncate">{nodeName}</span>
        {node.attributes.class && node.attributes.class !== nodeName && <span className="text-xs text-slate-500 ml-2 truncate">{node.attributes.class}</span>}
      </div>
      {isExpanded && hasChildren && (
        <div className="pl-5 border-l border-slate-700">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              filter={filter}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
