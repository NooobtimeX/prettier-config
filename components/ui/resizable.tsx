"use client";

import * as React from "react";
import { GripVerticalIcon } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";
import type {
	GroupProps,
	PanelProps,
	SeparatorProps,
} from "react-resizable-panels";

import { cn } from "@/lib/utils";

const GroupComp =
	(
		ResizablePrimitive as unknown as {
			Group?: React.ComponentType<unknown>;
			PanelGroup?: React.ComponentType<unknown>;
			default?: { Group?: React.ComponentType<unknown> };
		}
	).Group ??
	(
		ResizablePrimitive as unknown as {
			PanelGroup?: React.ComponentType<unknown>;
		}
	).PanelGroup ??
	(
		ResizablePrimitive as unknown as {
			default?: { Group?: React.ComponentType<unknown> };
		}
	).default?.Group;
const PanelComp =
	(ResizablePrimitive as unknown as { Panel?: React.ComponentType<unknown> })
		.Panel ??
	(ResizablePrimitive as unknown as { Panel?: React.ComponentType<unknown> })
		.Panel;
const SeparatorComp =
	(
		ResizablePrimitive as unknown as {
			Separator?: React.ComponentType<unknown>;
			PanelResizeHandle?: React.ComponentType<unknown>;
		}
	).Separator ??
	(
		ResizablePrimitive as unknown as {
			PanelResizeHandle?: React.ComponentType<unknown>;
		}
	).PanelResizeHandle ??
	(
		ResizablePrimitive as unknown as {
			Separator?: React.ComponentType<unknown>;
		}
	).Separator;

function ResizablePanelGroup({
	className,
	...props
}: GroupProps & { className?: string }) {
	const Comp = (GroupComp ?? (() => null)) as React.ElementType;
	return React.createElement(
		Comp,
		{
			"data-slot": "resizable-panel-group",
			className: cn(
				"flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
				className
			),
			...(props as unknown as Record<string, unknown>),
		},
		null
	);
}

function ResizablePanel({ ...props }: PanelProps) {
	const Comp = (PanelComp ?? (() => null)) as React.ElementType;
	return React.createElement(
		Comp,
		{
			"data-slot": "resizable-panel",
			...(props as unknown as Record<string, unknown>),
		},
		null
	);
}

function ResizableHandle({
	withHandle,
	className,
	...props
}: SeparatorProps & { withHandle?: boolean; className?: string }) {
	const Comp = (SeparatorComp ?? (() => null)) as React.ElementType;
	const handle =
		withHandle ?
			React.createElement(
				"div",
				{
					className:
						"bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border",
				},
				React.createElement(GripVerticalIcon, { className: "size-2.5" })
			)
		:	null;

	return React.createElement(
		Comp,
		{
			"data-slot": "resizable-handle",
			className: cn(
				"bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90",
				className
			),
			...(props as unknown as Record<string, unknown>),
		},
		handle
	);
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
