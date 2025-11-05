
import React, { useCallback, useState } from 'react';
import Editor from 'react-simple-code-editor';
import { debounce } from '../utils/debounce';

// We expect Prism to be loaded globally from index.html
declare const Prism: any;

interface ScriptEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
}

const ScriptEditor: React.FC<ScriptEditorProps> = ({ code, onCodeChange }) => {
  const [localCode, setLocalCode] = useState(code);

  const debouncedOnCodeChange = useCallback(debounce(onCodeChange, 500), [onCodeChange]);

  const handleValueChange = (newCode: string) => {
    setLocalCode(newCode);
    debouncedOnCodeChange(newCode);
  };
  
  const highlight = (codeToHighlight: string) => {
    if (typeof Prism !== 'undefined' && Prism.languages.lua) {
      return Prism.highlight(codeToHighlight, Prism.languages.lua, 'lua');
    }
    return codeToHighlight;
  };
  
  return (
    <div className="editor-container absolute inset-0">
        <Editor
            value={localCode}
            onValueChange={handleValueChange}
            highlight={highlight}
            padding={10}
            textareaClassName="focus:outline-none"
            preClassName="focus:outline-none"
            style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
                outline: 'none',
            }}
        />
    </div>
  );
};

export default ScriptEditor;
