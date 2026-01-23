use tauri::{menu::{Menu, MenuItem}, tray::TrayIconBuilder, Manager, WindowEvent};

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
        .setup(|app| {
            // ---- 系统托盘配置 (解决 Windows 彻底退出问题) ----
            let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            let show_i = MenuItem::with_id(app, "show", "显示窗口", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0); // 这里是 Windows 彻底退出的唯一途径
                    }
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let tauri::tray::TrayIconEvent::DoubleClick { .. } = event {
                        let _ = tray.app_handle().get_webview_window("main").unwrap().show();
                        let _ = tray.app_handle().get_webview_window("main").unwrap().set_focus();
                    }
                })
                .build(app)?;
            Ok(())
        })
        .build(tauri::generate_context!()) // ⚠️ 关键修改：这里用 build()
        .expect("error while building tauri application");

    app.run(|app_handle, event| {
        match event {
            tauri::RunEvent::WindowEvent { label, event, .. } => {
                match event {
                    WindowEvent::CloseRequested { api, .. } => {
                        // 1. 阻止默认关闭
                        api.prevent_close();

                        if let Some(window) = app_handle.get_webview_window(&label) {
                            // 无论 Mac 还是 Windows，点击 X 都直接隐藏窗口
                            // 这样 Windows 任务栏就不会有图标，应用在后台运行
                            let _ = window.hide();
                        }
                    }
                    _ => {}
                }
            }
            // 2. 👇 新增：处理 Mac Dock 图标点击事件
            // 当应用还在运行但窗口不可见时，点击 Dock 图标会触发这个事件
            #[cfg(target_os = "macos")]
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