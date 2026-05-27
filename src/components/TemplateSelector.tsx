import { useEditorStore } from '../store/useEditorStore';
import { animationTemplates } from '../lib/animationTemplates';
import { Button } from './ui/button';
import { formatDuration } from '../lib/utils-animation';

export function TemplateSelector() {
  const currentAnimation = useEditorStore((state) => state.currentAnimation);
  const screenshot = useEditorStore((state) => state.screenshot);
  const selectTemplate = useEditorStore((state) => state.selectTemplate);

  if (!screenshot) {
    return (
      <div className="text-center text-slate-400 py-8">
        Upload a screenshot to select a template
      </div>
    );
  }

  // Group templates by category
  const groupedTemplates: Record<string, typeof animationTemplates> = {};
  animationTemplates.forEach((template) => {
    if (!groupedTemplates[template.category]) {
      groupedTemplates[template.category] = [];
    }
    groupedTemplates[template.category].push(template);
  });

  const currentTemplateId = currentAnimation?.templateId;

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(groupedTemplates).map(([category, templates]) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase text-slate-400">
            {category}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {templates.map((template) => (
              <Button
                key={template.id}
                onClick={() => selectTemplate(template)}
                variant={currentTemplateId === template.id ? 'default' : 'outline'}
                className={`h-24 flex flex-col items-center justify-center whitespace-normal p-2 transition-all ${
                  currentTemplateId === template.id
                    ? 'ring-2 ring-blue-500'
                    : ''
                }`}
              >
                <div className="text-center">
                  <div className="text-sm font-semibold mb-1">
                    {template.displayName}
                  </div>
                  <div className="text-xs text-slate-400">
                    {formatDuration(template.defaultDuration)}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
