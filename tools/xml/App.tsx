import React, { useState, useCallback, useMemo, useRef } from 'react';
import { parseXml, serializeXml } from './services/xmlParser';
import { useUndoableState } from './hooks/useUndoableState';
import { findNodeById, updateNodeInTree, getNodeName } from './utils/treeUtils';
import type { XmlNode } from './types';
import Layout from './components/Layout';
import HierarchyTree from './components/HierarchyTree';
import PropertiesPanel from './components/PropertiesPanel';
import Footer from './components/Footer';
import ServicesVisibilityModal from './components/ServicesVisibilityModal';
import { FileUp } from 'lucide-react';

const App: React.FC = () => {
  const [
    xmlData,
    setXmlData,
    undo,
    redo,
    canUndo,
    canRedo
  ] = useUndoableState<XmlNode | null>(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showHierarchy, setShowHierarchy] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [showScript, setShowScript] = useState(true);

  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const [allServices, setAllServices] = useState<string[]>([]);
  const [hiddenServices, setHiddenServices] = useState<Set<string>>(new Set());

  const selectedNode = useMemo(() => {
    if (!selectedNodeId || !xmlData) return null;
    return findNodeById(xmlData, selectedNodeId);
  }, [selectedNodeId, xmlData]);

  const isScriptNode = useMemo(() => {
    if (!selectedNode) return false;
    const className = selectedNode.attributes.class || '';
    return className.toLowerCase().includes('script');
  }, [selectedNode]);
  
  const handleToggleService = useCallback((serviceName: string) => {
    setHiddenServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceName)) {
        newSet.delete(serviceName);
      } else {
        newSet.add(serviceName);
      }
      return newSet;
    });
  }, []);

  const handleShowAllServices = useCallback(() => {
    setHiddenServices(new Set());
  }, []);

  const handleHideAllServices = useCallback(() => {
    setHiddenServices(new Set(allServices));
  }, [allServices]);

  const visibleXmlData = useMemo(() => {
    if (!xmlData) return null;
    if (hiddenServices.size === 0) return xmlData;

    const filteredChildren = xmlData.children.filter(child => {
        const name = getNodeName(child);
        return !hiddenServices.has(name);
    });

    return { ...xmlData, children: filteredChildren };
  }, [xmlData, hiddenServices]);


  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError(null);
      setSelectedNodeId(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsedData = parseXml(content);
          setXmlData(parsedData);
          if (parsedData && parsedData.children) {
            const serviceNames = parsedData.children
              .map(child => getNodeName(child))
              .filter(name => name && name !== 'Item' && name !== 'roblox');
            setAllServices(serviceNames);
            setHiddenServices(new Set());
          }
        } catch (err) {
          setError(`Failed to parse XML file: ${err instanceof Error ? err.message : String(err)}`);
          setXmlData(null);
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read the file.');
        setIsLoading(false);
      };
      reader.readAsText(file);
    }
    // Reset file input to allow re-uploading the same file
    event.target.value = '';
  }, [setXmlData]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = useCallback(() => {
    if (xmlData) {
      try {
        const xmlString = serializeXml(xmlData);
        const blob = new Blob([xmlString], { type: 'text/xml' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'edited-game.rbxlx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        setError(`Failed to serialize XML: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }, [xmlData]);

  const handleNodeUpdate = useCallback((updatedNode: XmlNode) => {
    if (xmlData) {
      const newTree = updateNodeInTree(xmlData, updatedNode);
      if (newTree) {
        setXmlData(newTree);
      }
    }
  }, [xmlData, setXmlData]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400 mx-auto"></div>
            <p className="mt-4 text-lg">Parsing XML...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full p-8">
          <div className="bg-red-900/50 border border-red-700 text-red-200 p-6 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="font-mono">{error}</p>
            <button
              onClick={handleImportClick}
              className="mt-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md inline-flex items-center"
            >
              <FileUp className="w-5 h-5 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (!xmlData) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Roblox XML Editor</h1>
            <p className="text-slate-400 mb-8">Import an .rbxlx file to begin editing.</p>
            <button
              onClick={handleImportClick}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg inline-flex items-center text-lg"
            >
              <FileUp className="w-6 h-6 mr-3" />
              Import File
            </button>
          </div>
        </div>
      );
    }

    const rightPanelContent = (
        <div className="flex flex-col h-full bg-slate-800/50 rounded-lg overflow-hidden">
             {showProperties && (!isScriptNode || !showScript) && (
                <div className="flex-grow overflow-auto">
                    <PropertiesPanel key={selectedNodeId} node={selectedNode} onUpdate={handleNodeUpdate} />
                </div>
            )}
             {showScript && isScriptNode && (
                <div className="flex-grow overflow-auto h-full">
                   <PropertiesPanel key={selectedNodeId} node={selectedNode} onUpdate={handleNodeUpdate} isScriptEditor={true} />
                </div>
            )}
            {!selectedNode && (
                 <div className="flex items-center justify-center h-full text-slate-500">
                    <p>Select an item from the hierarchy to view its properties.</p>
                </div>
            )}
        </div>
    );


    return (
      <Layout
        left={
          showHierarchy && visibleXmlData ? (
            <div className="bg-slate-800/50 rounded-lg h-full overflow-hidden">
                <HierarchyTree
                    node={visibleXmlData}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={setSelectedNodeId}
                />
            </div>
          ) : null
        }
        right={(showProperties || showScript) && xmlData ? rightPanelContent : <div className="flex items-center justify-center h-full text-slate-500 bg-slate-800/50 rounded-lg"><p>Properties panel is hidden.</p></div>}
      />
    );
  };


  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col font-sans">
      <input type="file" accept=".rbxlx,.xml" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      <main className="flex-grow p-2 overflow-hidden">
        {renderContent()}
      </main>
      <Footer 
        onImport={handleImportClick}
        onSave={handleSave}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        hasData={!!xmlData}
        viewOptions={{
          hierarchy: { shown: showHierarchy, toggle: () => setShowHierarchy(s => !s) },
          properties: { shown: showProperties, toggle: () => setShowProperties(s => !s) },
          script: { shown: showScript, toggle: () => setShowScript(s => !s) },
        }}
        onToggleServices={() => setIsServicesModalOpen(true)}
      />
       <ServicesVisibilityModal
        isOpen={isServicesModalOpen}
        onClose={() => setIsServicesModalOpen(false)}
        allServices={allServices}
        hiddenServices={hiddenServices}
        onToggleService={handleToggleService}
        onShowAll={handleShowAllServices}
        onHideAll={handleHideAllServices}
      />
    </div>
  );
};

export default App;