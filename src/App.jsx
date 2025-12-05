import { useState, useEffect } from 'react';

function App() {
  const [config, setConfig] = useState(null);
  const [activeTab, setActiveTab] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showConfigEditor, setShowConfigEditor] = useState(false);
  const [configText, setConfigText] = useState('');

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(import.meta.env.BASE_URL + 'form_config.json?t=' + new Date().getTime());
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

  const handleEditConfig = () => {
    setConfigText(JSON.stringify(config, null, 2));
    setShowConfigEditor(true);
  };

  const handleApplyConfig = () => {
    try {
      const newConfig = JSON.parse(configText);
      setConfig(newConfig);
      setShowConfigEditor(false);
      alert('設定を適用しました（一時的）');
    } catch (error) {
      alert('JSON解析エラー: ' + error.message);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form_data_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearForm = () => {
    if (confirm('すべての入力をクリアしますか？')) {
      setFormData({});
    }
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
            <input
              type="text"
              data-field-id="証番号"
              value={formData['証番号'] || '0646349'}
              onChange={(e) => handleInputChange('証番号', e.target.value)}
              className="bg-yellow"
            />
          </div>
        </div>
        <div className="field-row">
          <div className="field-label">組合員番号</div>
          <div className="field-input-container">
            <input
              type="text"
              data-field-id="組合員番号"
              value={formData['組合員番号'] || '1300570'}
              onChange={(e) => handleInputChange('組合員番号', e.target.value)}
              className="bg-white"
            />
          </div>
        </div>
        <div className="field-row">
          <div className="field-label">氏名</div>
          <div className="field-input-container">
            <input
              type="text"
              data-field-id="氏名"
              value={formData['氏名'] || '松山 英樹'}
              onChange={(e) => handleInputChange('氏名', e.target.value)}
              className="bg-white"
            />
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

      {/* Control Buttons */}
      <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button
          id="btn-complete"
          onClick={() => {
            // 簡易バリデーション: 必須項目が入力されているか確認
            const requiredFields = ['証番号', '組合員番号', '氏名'];
            const missing = requiredFields.filter(f => !formData[f]);

            if (missing.length > 0) {
              alert(`未入力の項目があります: ${missing.join(', ')}`);
              return;
            }

            // 完了メッセージ
            alert('入力が完了しました！見積もりファイルをダウンロードします。');

            // 1.csv を自動ダウンロード
            const link = document.createElement('a');
            link.href = '/1.csv';
            link.download = `estimate_${new Date().getTime()}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          style={{ padding: '4px 12px', backgroundColor: '#00BFA5', color: 'white', border: 'none', fontWeight: 'bold' }}
        >
          ✅ 完了 (Runner用)
        </button>
        <button onClick={handleEditConfig} style={{ padding: '4px 12px' }}>📝 設定編集</button>
        <button onClick={loadConfig} style={{ padding: '4px 12px' }}>🔄 設定再読込</button>
        <button onClick={handleExportData} style={{ padding: '4px 12px' }}>💾 データ出力</button>
        <button onClick={handleClearForm} style={{ padding: '4px 12px' }}>🗑️ クリア</button>
      </div>

      {/* Config Editor Modal */}
      {showConfigEditor && (
        <div className="modal-overlay" onClick={() => setShowConfigEditor(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>設定編集（一時的）</h3>
            <textarea
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              style={{
                width: '100%',
                height: '400px',
                fontFamily: 'monospace',
                fontSize: '12px',
                padding: '8px'
              }}
            />
            <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowConfigEditor(false)}>キャンセル</button>
              <button onClick={handleApplyConfig} style={{ fontWeight: 'bold' }}>適用</button>
            </div>
          </div>
        </div>
      )}
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
            data-field-id={field.id}
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
            data-field-id={field.id}
            value={value}
            placeholder={field.placeholder}
            onChange={(e) => onChange(field.id, e.target.value)}
            className={isYellow ? 'bg-yellow' : 'bg-white'}
          />
        )}

        {field.type === 'date' && (
          <input
            type="date"
            data-field-id={field.id}
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
                  data-field-id={field.id}
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
