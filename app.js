:root {
    --bg-color: #f4f6f9;
    --card-bg: #ffffff;
    --primary-color: #4f46e5;
    --primary-hover: #4338ca;
    --text-color: #1f2937;
    --text-muted: #6b7280;
    --border-color: #e5e7eb;
    --active-color: #e0e7ff;
    --header-bg: #ffffff;
}

[data-theme="dark"] {
    --bg-color: #0f172a;
    --card-bg: #1e293b;
    --primary-color: #6366f1;
    --primary-hover: #4f46e5;
    --text-color: #f8fafc;
    --text-muted: #94a3b8;
    --border-color: #334155;
    --active-color: #312e81;
    --header-bg: #1e293b;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { background-color: var(--bg-color); color: var(--text-color); line-height: 1.6; padding-bottom: 40px; font-family: system-ui, -apple-system, sans-serif; transition: background-color 0.3s, color 0.3s; }

.app-header { background-color: var(--header-bg); padding: 15px; border-bottom: 1px solid var(--border-color); }
.header-main { display: flex; justify-content: space-between; align-items: center; max-width: 600px; margin: 0 auto; }
.header-controls { display: flex; align-items: center; gap: 12px; }
.app-header h1 { font-size: 1.3rem; color: var(--text-color); }

/* Authentication Display Bar CSS */
.auth-bar { display: flex; justify-content: center; align-items: center; max-width: 600px; margin: 12px auto 0 auto; padding: 10px; border-radius: 8px; }
.btn-google { width: 100%; background-color: #4285f4; color: white; padding: 10px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
.user-profile { display: flex; align-items: center; gap: 10px; }
#user-avatar { width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--primary-color); }
.user-details { display: flex; flex-direction: column; text-align: left; }
#user-name { font-weight: 600; font-size: 0.9rem; }
.sync-badge { font-size: 0.75rem; color: #10b981; }
.btn-logout-sm { background-color: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; margin-left: auto;}

.container { max-width: 600px; margin: 0 auto; padding: 0 15px; }
.card { background-color: var(--card-bg); border-radius: 12px; padding: 20px; margin-bottom: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid var(--border-color); }
.card h2 { font-size: 1.1rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }

.input-group { margin-bottom: 12px; }
.input-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px; color: var(--text-color); }
input[type="text"], input[type="file"] { width: 100%; padding: 8px; border-radius: 8px; border: 1px solid var(--border-color); background-color: var(--bg-color); color: var(--text-color); font-size: 0.95rem; }
.control-select { padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border-color); background-color: var(--card-bg); color: var(--text-color); font-size: 0.85rem; }
.control-select-sm { padding: 5px; border-radius: 6px; border: 1px solid var(--border-color); background-color: var(--card-bg); color: var(--text-color); font-size: 0.8rem; }
.theme-btn { background: var(--border-color); border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1rem; }

.divider { height: 1px; background-color: var(--border-color); margin: 15px 0; }
.btn { width: 100%; padding: 10px; border-radius: 8px; border: none; font-size: 0.95rem; font-weight: 600; cursor: pointer; display: block; text-align: center; }
.btn-primary { background-color: var(--primary-color); color: white; margin-top: 15px; }
.btn-secondary { background-color: #10b981; color: white; margin-top: 8px; }

/* Fixed Photo Button and Font controls grid */
.btn-photo { background-color: #6366f1; color: white; padding: 8px 12px; font-size: 0.85rem; border-radius: 6px; border:none; cursor:pointer; white-space: nowrap; min-width: max-content;}
.btn-add { width: auto; padding: 5px 12px; background-color: var(--primary-color); color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem;}
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }

.toolbar-extras { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 8px; }
.font-controls { display: flex; gap: 4px; }

.tabs-wrapper { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.tabs-container { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; }
.chapter-tab { padding: 6px 14px; background-color: var(--bg-color); border: 1px solid var(--border-color); border-radius: 18px; font-size: 0.85rem; cursor: pointer; white-space: nowrap; color: var(--text-color); }
.chapter-tab.active { background-color: var(--active-color); border-color: var(--primary-color); color: var(--primary-color); font-weight: 600; }

.reorder-controls { display: flex; gap: 6px; justify-content: flex-end; }
.btn-nav, .btn-danger-sm { background-color: var(--bg-color); border: 1px solid var(--border-color); color: var(--text-color); padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
.btn-danger-sm { background-color: #ef4444; color: white; border: none; }

#editor-wrapper { background: white; color: #333333; border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; }
#editor-container { min-height: 200px; font-size: 15px; border: none !important; }
#editor-container img { max-width: 100%; height: auto; border-radius: 6px; display: block; margin: 10px auto; }

.toc-preview-section { background-color: var(--bg-color); padding: 12px; border-radius: 8px; margin-top: 15px; border: 1px dashed var(--border-color); }
.toc-preview-section h3 { font-size: 0.85rem; margin-bottom: 6px; color: var(--text-color); }
#toc-preview-list { list-style-type: decimal; padding-left: 18px; font-size: 0.85rem; color: var(--text-muted); }
#toc-preview-list li { margin-bottom: 3px; cursor: pointer; color: var(--primary-color); }
#toc-preview-list li:hover { text-decoration: underline; }
