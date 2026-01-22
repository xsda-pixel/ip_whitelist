use tauri::{Manager, WindowEvent};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 第一步：先构建 App 实例 (注意结尾是 .build 而不是 .run)
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|_app| {
            // 这里可以做初始化
            Ok(())
        })
        .build(tauri::generate_context!()) // ⚠️ 关键修改：这里用 build()
        .expect("error while building tauri application");

    // 第二步：在 app 实例上调用 run，这里才允许传入回调逻辑
    app.run(|app_handle, event| {
        match event {
            tauri::RunEvent::WindowEvent { label, event, .. } => {
                match event {
                    WindowEvent::CloseRequested { api, .. } => {
                        // 1. 阻止默认关闭
                        api.prevent_close();

                        // 2. 执行最小化或隐藏
                        // 注意：这里使用 app_handle 来获取窗口
                        if let Some(window) = app_handle.get_webview_window(&label) {
                            // Mac 上推荐用 hide
                            #[cfg(target_os = "macos")]
                            let _ = window.hide();

                            // Windows 上依然推荐 minimize
                            #[cfg(not(target_os = "macos"))]
                            let _ = window.minimize();
                        }
                    }
                    _ => {}
                }
            }
            // 2. 👇 新增：处理 Mac Dock 图标点击事件
            // 当应用还在运行但窗口不可见时，点击 Dock 图标会触发这个事件
            tauri::RunEvent::Reopen { .. } => {
                 // 找到主窗口并显示
                 if let Some(window) = app_handle.get_webview_window("main") {
                     let _ = window.show();
                     let _ = window.set_focus(); // 让它获得焦点
                 }
            }
            _ => {}
        }
    });
}