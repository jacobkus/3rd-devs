import mermaid from 'mermaid';
import { useEffect, useState } from 'react';

const DIAGRAMS = [
  'simple',
  'message',
  'advanced',
  'parallel',
  'advanced-parallel',
];

export default function App() {
  const [diagram, setDiagram] = useState<string>('');
  const [selectedDiagram, setSelectedDiagram] = useState(DIAGRAMS[0]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      flowchart: {
        curve: 'basis',
        padding: 20,
      },
    });

    const drawDiagram = async () => {
      const { svg } = await mermaid.render(
        'workflow-diagram',
        await fetch(`diagram/${selectedDiagram}-workflow-diagram.md`).then(res => res.text())
      );
      setDiagram(svg);
    };
    drawDiagram();
  }, [selectedDiagram]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <select
          value={selectedDiagram}
          onChange={(e) => setSelectedDiagram(e.target.value)}
          className="block w-full mb-8 px-4 py-2 text-base border-0 rounded-md bg-white shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-teal-600 sm:text-sm sm:leading-6 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          {DIAGRAMS.map((name) => (
            <option key={name} value={name}>
              {name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </option>
          ))}
        </select>
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div dangerouslySetInnerHTML={{ __html: diagram }} />
        </div>
      </div>
    </div>
  );
}
