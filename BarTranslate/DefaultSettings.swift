//
//  Settings.swift
//  BarTranslate
//
//  Created by Thijmen Dam on 19/07/2023.
//


import Foundation
import HotKey
import AppKit

enum TranslationProvider: String {
  case google, deepl
}

enum MenuBarIcon: String, CaseIterable, Identifiable {
  case icon = "MenuIcon"
  case iconMinimal = "MenuIconMinimal"
  
  var id: String { self.rawValue }
}

struct DefaultSettings {
  
  static let translationProvider = TranslationProvider.google
  static let menuBarIcon = MenuBarIcon.icon
  
  struct ToggleApp {
    static let key = Key(string: ";")!
    static let modifier = Key(string: "⌥")!
  }
  
}
