import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import {
  ToolInvocationBadge,
  getToolLabel,
} from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

// --- getToolLabel unit tests ---

test("getToolLabel: str_replace_editor create returns Creating <file>", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "create", path: "/App.jsx" })
  ).toBe("Creating App.jsx");
});

test("getToolLabel: str_replace_editor str_replace returns Editing <file>", () => {
  expect(
    getToolLabel("str_replace_editor", {
      command: "str_replace",
      path: "/components/Card.jsx",
    })
  ).toBe("Editing Card.jsx");
});

test("getToolLabel: str_replace_editor insert returns Editing <file>", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "insert", path: "/App.jsx" })
  ).toBe("Editing App.jsx");
});

test("getToolLabel: str_replace_editor view returns Reading <file>", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "view", path: "/App.jsx" })
  ).toBe("Reading App.jsx");
});

test("getToolLabel: str_replace_editor undo_edit returns Undoing edit", () => {
  expect(
    getToolLabel("str_replace_editor", {
      command: "undo_edit",
      path: "/App.jsx",
    })
  ).toBe("Undoing edit");
});

test("getToolLabel: str_replace_editor missing path returns generic message", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "create" })
  ).toBe("Creating file");
});

test("getToolLabel: file_manager delete returns Deleting <file>", () => {
  expect(
    getToolLabel("file_manager", { command: "delete", path: "/old.jsx" })
  ).toBe("Deleting old.jsx");
});

test("getToolLabel: file_manager rename returns Renaming <file>", () => {
  expect(
    getToolLabel("file_manager", {
      command: "rename",
      path: "/old.jsx",
      new_path: "/new.jsx",
    })
  ).toBe("Renaming old.jsx");
});

test("getToolLabel: file_manager missing path returns generic message", () => {
  expect(getToolLabel("file_manager", { command: "delete" })).toBe(
    "Deleting file"
  );
});

test("getToolLabel: unknown tool name returns the tool name as-is", () => {
  expect(getToolLabel("some_unknown_tool", {})).toBe("some_unknown_tool");
});

// --- ToolInvocationBadge component tests ---

test("ToolInvocationBadge shows friendly label with spinner while pending", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "call",
      }}
    />
  );

  expect(screen.getByText("Creating App.jsx")).toBeDefined();
  expect(document.querySelector("svg")).toBeDefined();
  expect(document.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolInvocationBadge shows green dot when result is received", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/Card.jsx" },
        state: "result",
        result: "Success",
      }}
    />
  );

  expect(screen.getByText("Editing Card.jsx")).toBeDefined();
  expect(document.querySelector(".bg-emerald-500")).toBeDefined();
});

test("ToolInvocationBadge renders file_manager delete label", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "2",
        toolName: "file_manager",
        args: { command: "delete", path: "/utils.js" },
        state: "result",
        result: { success: true },
      }}
    />
  );

  expect(screen.getByText("Deleting utils.js")).toBeDefined();
});

test("ToolInvocationBadge renders file_manager rename label", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "3",
        toolName: "file_manager",
        args: { command: "rename", path: "/old.jsx", new_path: "/new.jsx" },
        state: "call",
      }}
    />
  );

  expect(screen.getByText("Renaming old.jsx")).toBeDefined();
});

test("ToolInvocationBadge falls back to tool name for unknown tools", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "4",
        toolName: "mystery_tool",
        args: {},
        state: "call",
      }}
    />
  );

  expect(screen.getByText("mystery_tool")).toBeDefined();
});
