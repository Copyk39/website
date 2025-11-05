import React from 'react';
import { FileUp, Save, Undo, Redo, PanelLeft, Info, Code, Layers } from 'lucide-react';

interface ViewOption {
  shown: boolean;
  toggle: () => void;
}
interface FooterProps {
  onImport: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasData: boolean;
  viewOptions: {
    hierarchy: ViewOption;
    properties: ViewOption;
    script: ViewOption;
  };
  onToggleServices: () => void;
}

const FooterButton: React.FC<{
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  tooltip: string;
}> = ({ onClick, disabled, children, tooltip }) => (
    <div className="relative group">
        <button
            onClick={onClick}
            disabled={disabled}
            className="flex items-center justify-center h-10 w-10 bg-slate-700/50 hover:bg-slate-600/50 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed rounded-md text-slate-300 hover:text-white"
        >
            {children}
        </button>
         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
            {tooltip}
        </div>
    </div>
);


const Footer: React.FC<FooterProps> = ({
  onImport, onSave, onUndo, onRedo, canUndo, canRedo, hasData, viewOptions, onToggleServices
}) => {
  return (
    <footer className="w-full bg-slate-800/70 border-t border-slate-700 p-2 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
            <FooterButton onClick={onUndo} disabled={!canUndo} tooltip="Undo (Ctrl+Z)">
                <Undo className="w-5 h-5" />
            </FooterButton>
            <FooterButton onClick={onRedo} disabled={!canRedo} tooltip="Redo (Ctrl+Y)">
                <Redo className="w-5 h-5" />
            </FooterButton>
        </div>

        <div className="flex items-center gap-2">
             <FooterButton onClick={viewOptions.hierarchy.toggle} tooltip={viewOptions.hierarchy.shown ? 'Hide Hierarchy' : 'Show Hierarchy'}>
                {viewOptions.hierarchy.shown ? <PanelLeft className="w-5 h-5 text-cyan-400" /> : <PanelLeft className="w-5 h-5" />}
            </FooterButton>
             <FooterButton onClick={viewOptions.properties.toggle} tooltip={viewOptions.properties.shown ? 'Hide Properties' : 'Show Properties'}>
                {viewOptions.properties.shown ? <Info className="w-5 h-5 text-cyan-400" /> : <Info className="w-5 h-5" />}
            </FooterButton>
             <FooterButton onClick={viewOptions.script.toggle} tooltip={viewOptions.script.shown ? 'Hide Script View' : 'Show Script View'}>
                {viewOptions.script.shown ? <Code className="w-5 h-5 text-cyan-400" /> : <Code className="w-5 h-5" />}
            </FooterButton>
            <FooterButton onClick={onToggleServices} tooltip="Show/Hide Services" disabled={!hasData}>
                <Layers className="w-5 h-5" />
            </FooterButton>
        </div>
        
        <div className="flex items-center gap-2">
            <FooterButton onClick={onImport} tooltip="Import .rbxlx File">
                <FileUp className="w-5 h-5" />
            </FooterButton>
            <FooterButton onClick={onSave} disabled={!hasData} tooltip="Save .rbxlx File">
                <Save className="w-5 h-5" />
            </FooterButton>
        </div>
    </footer>
  );
};

export default Footer;