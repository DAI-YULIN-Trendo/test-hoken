import { useState, useEffect } from 'react';

function App() {
  const [config, setConfig] = useState(null);
  const [activeTab, setActiveTab] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/form_config.json?t=' + new Date().getTime());
      const data = await response.json();
      setConfig(data);
      if (data.tabs && data.tabs.length > 0) {
        if (!activeTab || !data.tabs.find(t => t.id === activeTab)) {
          setActiveTab(data.tabs[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load config:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleInputChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  if (loading) return <div style={{ padding: 20 }}>読み込み中...</div>;
  if (!config) return <div style={{ padding: 20 }}>設定ファイルが見つかりません。</div>;

  const currentTab = config.tabs.find(t => t.id === activeTab);

  return (
    <div className="app-container">
      {/* Top Info Header */}
      <div className="header-section">
        <div className="field-row">
          <div className="field-label">証番号</div>
          <div className="field-input-container">
            <input type="text" value="0646349" readOnly className="bg-yellow" />
          </div>
        </div>
        <div className="field-row">
          <div className="field-label">組合員番号</div>
          <div className="field-input-container">
            <input type="text" value="1300570" readOnly className="bg-white" />
          </div>
        </div>
        <div className="field-row">
          <div className="field-label">氏名</div>
          <div className="field-input-container">
            <input type="text" value="松山 英樹" className="bg-white" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-nav">
        {config.tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-panel">
        {currentTab && (
          <div className="legacy-grid">
            {currentTab.fields.map(field => (
              <LegacyField
                key={field.id}
                field={field}
                value={formData[field.id] || ''}
                onChange={handleInputChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Simple Footer for Reload */}
      <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={loadConfig} style={{ padding: '4px 12px' }}>設定再読込</button>
      </div>
    </div>
  );
}

function LegacyField({ field, value, onChange }) {
  // Determine background color
  const isYellow = field.type === 'select' || field.id.includes('date') || field.type === 'date';

  return (
    <div className="field-row">
      <div className="field-label">{field.label}</div>
      <div className="field-input-container">
        {field.type === 'select' && (
          <select
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
            className={isYellow ? 'bg-yellow' : 'bg-white'}
          >
            <option value=""></option>
            {field.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )}

        {field.type === 'text' && (
          <input
            type="text"
            value={value}
            placeholder={field.placeholder}
            onChange={(e) => onChange(field.id, e.target.value)}
            className={isYellow ? 'bg-yellow' : 'bg-white'}
          />
        )}

        {field.type === 'date' && (
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
            className={isYellow ? 'bg-yellow' : 'bg-white'}
          />
        )}

        {field.type === 'radio' && (
          <div className="radio-group">
            {field.options.map(opt => (
              <label key={opt} className="radio-label">
                <input
                  type="radio"
                  name={field.id}
                  value={opt}
                  checked={value === opt}
                  onChange={(e) => onChange(field.id, e.target.value)}
                />
                {opt}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
