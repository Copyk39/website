import React, { useState, useCallback } from 'react';
import type { XmlNode } from '../types';
import ScriptEditor from './ScriptEditor';
import { debounce } from '../utils/debounce';
import { getNodeName } from '../utils/treeUtils';

interface PropertiesPanelProps {
  node: XmlNode | null;
  onUpdate: (updatedNode: XmlNode) => void;
  isScriptEditor?: boolean;
}

const PropertyInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);
  
  const debouncedOnChange = useCallback(debounce(onChange, 500), [onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
    debouncedOnChange(e.target.value);
  };

  return (
    <div className="grid grid-cols-3 gap-2 items-center mb-2">
      <label className="text-sm text-slate-400 truncate col-span-1">{label}</label>
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        className="col-span-2 bg-slate-900 border border-slate-700 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
      />
    </div>
  );
};

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ node, onUpdate, isScriptEditor = false }) => {
  if (!node) {
    return null;
  }
  
  if (isScriptEditor) {
    const propertiesNode = node.children.find(c => c.tag === 'Properties');
    const scriptContentNode = propertiesNode?.children.find(c => c.tag === 'ProtectedString' && c.attributes.name === 'Source');
    
    if (!scriptContentNode) {
      return (
        <div className="h-full flex flex-col p-4 bg-slate-800 rounded-lg items-center justify-center">
          <p className="text-slate-500">No script source found for this item.</p>
        </div>
      );
    }

    const handleTextContentChange = (value: string) => {
      const updatedNode = { ...scriptContentNode, textContent: value };
      onUpdate(updatedNode);
    };

    return (
      <div className="h-full flex flex-col p-4 bg-slate-800 rounded-lg">
        <h2 className="text-lg font-semibold mb-3 pb-2 border-b border-slate-700 text-slate-200">
          Script Editor: <span className="font-mono text-cyan-400">{getNodeName(node)}</span>
        </h2>
        <div className="flex-grow relative">
          <ScriptEditor
            code={scriptContentNode.textContent || ''}
            onCodeChange={handleTextContentChange}
          />
        </div>
      </div>
    );
  }


  const handleAttributeChange = (attrName: string, value: string) => {
    const updatedNode = {
      ...node,
      attributes: {
        ...node.attributes,
        [attrName]: value,
      },
    };
    onUpdate(updatedNode);
  };

  const handleTextContentChange = (value: string) => {
    const updatedNode = { ...node, textContent: value };
    onUpdate(updatedNode);
  };

  const propertiesNode = node.tag === 'Item' ? node.children.find(c => c.tag === 'Properties') : null;
  const properties = propertiesNode ? propertiesNode.children : (node.tag === 'Properties' ? node.children : []);

  return (
    <div className="p-4 bg-slate-800 rounded-lg h-full overflow-y-auto">
      <h2 className="text-lg font-semibold mb-3 pb-2 border-b border-slate-700 text-slate-200">
        Properties
      </h2>
      
      <div className="mb-4">
        <h3 className="font-bold text-sm text-slate-400 uppercase mb-2">Node Info</h3>
        <div className="text-sm bg-slate-900/50 p-3 rounded-md">
            <p><span className="font-semibold text-slate-400">Tag:</span> <span className="font-mono text-amber-300">{node.tag}</span></p>
            <p><span className="font-semibold text-slate-400">ID:</span> <span className="font-mono text-xs text-slate-500">{node.id}</span></p>
        </div>
      </div>

      {Object.keys(node.attributes).length > 0 && (
        <div className="mb-4">
          <h3 className="font-bold text-sm text-slate-400 uppercase mb-2">Attributes</h3>
          {Object.entries(node.attributes).map(([key, value]) => (
            <PropertyInput key={key} label={key} value={value} onChange={(newValue) => handleAttributeChange(key, newValue)} />
          ))}
        </div>
      )}
      
      {properties.length > 0 && (
        <div className="mb-4">
            <h3 className="font-bold text-sm text-slate-400 uppercase mb-2">Properties</h3>
            {properties.map(prop => (
                <PropertyInput 
                    key={prop.id} 
                    label={prop.attributes.name}
                    value={prop.textContent || ''}
                    onChange={(newValue) => onUpdate({...prop, textContent: newValue})}
                />
            ))}
        </div>
      )}
      
      {node.textContent && properties.length === 0 && !isScriptEditor && (
        <div className="mb-4">
          <h3 className="font-bold text-sm text-slate-400 uppercase mb-2">Text Content</h3>
           <textarea
              value={node.textContent}
              onChange={(e) => handleTextContentChange(e.target.value)}
              className="w-full h-24 bg-slate-900 border border-slate-700 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
            />
        </div>
      )}
    </div>
  );
};

export default PropertiesPanel;
