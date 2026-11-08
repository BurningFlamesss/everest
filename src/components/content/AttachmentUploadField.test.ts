// @vitest-environment jsdom

import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	type AttachmentEntry,
	AttachmentUploadField,
} from "./AttachmentUploadField.tsx";

vi.mock("#/lib/utils.ts", () => ({
	cn: (...classes: Array<string | undefined>) =>
		classes.filter(Boolean).join(" "),
}));

const fetchMock = vi.fn<typeof fetch>();
const initialEntries: Array<AttachmentEntry> = [
	{
		fileAssetId: "existing-handbook",
		url: "/uploads/handbook.pdf",
		name: "handbook.pdf",
		label: "Club handbook",
	},
	{
		fileAssetId: "existing-schedule",
		url: "/uploads/schedule.csv",
		name: "schedule.csv",
		label: "",
	},
];
const uploadedAsset = {
	id: "uploaded-document",
	url: "/uploads/new-document.pdf",
	originalName: "new-document.pdf",
};
const pickerLabel = /Add a PDF, Word, Excel, CSV or text file/;

function submittedAttachments(container: HTMLElement, name = "attachments") {
	const input = container.querySelector<HTMLInputElement>(
		`input[type="hidden"][name="${name}"]`,
	);
	if (!input) throw new Error(`Missing hidden input: ${name}`);
	return JSON.parse(input.value);
}

function selectFile() {
	const input = screen.getByLabelText<HTMLInputElement>(pickerLabel);
	const file = new File(["document contents"], "selected.pdf", {
		type: "application/pdf",
	});
	fireEvent.change(input, { target: { files: [file] } });
	return { input, file };
}

beforeEach(() => {
	fetchMock.mockReset();
	vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe("AttachmentUploadField", () => {
	it("prepopulates links and submits only existing IDs and unchanged labels", () => {
		const { container } = render(
			React.createElement(AttachmentUploadField, {
				initialEntries,
				name: "clubAttachments",
				label: "Club documents",
			}),
		);

		expect(screen.getByText("Club documents")).toBeTruthy();
		expect(
			screen.getByRole("link", { name: "Club handbook" }).getAttribute("href"),
		).toBe(initialEntries[0].url);
		expect(
			screen.getByRole("link", { name: "schedule.csv" }).getAttribute("href"),
		).toBe(initialEntries[1].url);
		expect(submittedAttachments(container, "clubAttachments")).toEqual([
			{ fileAssetId: "existing-handbook", label: "Club handbook" },
			{ fileAssetId: "existing-schedule", label: "" },
		]);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("removes an existing link locally without deleting its file asset", () => {
		const { container } = render(
			React.createElement(AttachmentUploadField, { initialEntries }),
		);

		fireEvent.click(
			screen.getByRole("button", { name: "Remove handbook.pdf" }),
		);

		expect(screen.queryByRole("link", { name: "Club handbook" })).toBeNull();
		expect(screen.getByRole("link", { name: "schedule.csv" })).toBeTruthy();
		expect(submittedAttachments(container)).toEqual([
			{ fileAssetId: "existing-schedule", label: "" },
		]);
		expect(initialEntries).toHaveLength(2);
		expect(initialEntries[0].fileAssetId).toBe("existing-handbook");
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it.each([
		{
			description: "default",
			prefix: undefined,
			expectedPrefix: "attachments",
		},
		{
			description: "custom",
			prefix: "club-documents",
			expectedPrefix: "club-documents",
		},
	])("uploads a document with the $description prefix and appends its asset ID", async ({
		prefix,
		expectedPrefix,
	}) => {
		fetchMock.mockResolvedValueOnce(
			Response.json({ success: true, asset: uploadedAsset }),
		);
		const { container } = render(
			React.createElement(AttachmentUploadField, { initialEntries, prefix }),
		);

		const { input, file } = selectFile();

		expect(fetchMock).toHaveBeenCalledExactlyOnceWith("/api/uploads", {
			method: "POST",
			body: expect.any(FormData),
		});
		const body = fetchMock.mock.calls[0][1]?.body as FormData;
		expect(body.get("file")).toBe(file);
		expect(body.get("prefix")).toBe(expectedPrefix);
		expect(Array.from(body.keys()).sort()).toEqual(["file", "prefix"]);
		expect(input.value).toBe("");
		expect(
			(
				await screen.findByRole("link", { name: uploadedAsset.originalName })
			).getAttribute("href"),
		).toBe(uploadedAsset.url);
		expect(submittedAttachments(container)).toEqual([
			{ fileAssetId: "existing-handbook", label: "Club handbook" },
			{ fileAssetId: "existing-schedule", label: "" },
			{ fileAssetId: uploadedAsset.id, label: uploadedAsset.originalName },
		]);
		expect(input.disabled).toBe(false);

		fireEvent.click(
			screen.getByRole("button", {
				name: `Remove ${uploadedAsset.originalName}`,
			}),
		);
		expect(submittedAttachments(container)).toHaveLength(2);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it.each([
		{
			description: "HTTP failure even with a success payload",
			status: 500,
			body: {
				success: true,
				asset: uploadedAsset,
				error: "Storage unavailable",
			},
			error: "Storage unavailable",
		},
		{
			description: "unsuccessful payload even with an asset",
			status: 200,
			body: {
				success: false,
				asset: uploadedAsset,
				error: "File type not allowed",
			},
			error: "File type not allowed",
		},
		{
			description: "missing asset",
			status: 200,
			body: { success: true },
			error: "Could not upload this file.",
		},
	])("shows an error without adding an entry on $description", async ({
		status,
		body,
		error,
	}) => {
		fetchMock.mockResolvedValueOnce(Response.json(body, { status }));
		const onUploadingChange = vi.fn();
		const { container } = render(
			React.createElement(AttachmentUploadField, {
				initialEntries,
				onUploadingChange,
			}),
		);

		const { input } = selectFile();

		expect(await screen.findByText(error)).toBeTruthy();
		expect(submittedAttachments(container)).toEqual([
			{ fileAssetId: "existing-handbook", label: "Club handbook" },
			{ fileAssetId: "existing-schedule", label: "" },
		]);
		expect(screen.getAllByRole("link")).toHaveLength(2);
		expect(
			screen.queryByRole("link", { name: uploadedAsset.originalName }),
		).toBeNull();
		expect(onUploadingChange.mock.calls).toEqual([[true], [false]]);
		expect(input.disabled).toBe(false);
	});

	it.each([
		{
			rejection: new Error("Network connection lost"),
			error: "Network connection lost",
		},
		{ rejection: "network failure", error: "Could not upload this file." },
	])("handles a rejected upload with '$error' and leaves the field empty", async ({
		rejection,
		error,
	}) => {
		fetchMock.mockRejectedValueOnce(rejection);
		const onUploadingChange = vi.fn();
		const { container } = render(
			React.createElement(AttachmentUploadField, { onUploadingChange }),
		);

		const { input } = selectFile();

		expect(await screen.findByText(error)).toBeTruthy();
		expect(submittedAttachments(container)).toEqual([]);
		expect(screen.queryByRole("link")).toBeNull();
		expect(onUploadingChange.mock.calls).toEqual([[true], [false]]);
		expect(input.disabled).toBe(false);
	});

	it("reports pending uploads and disables picking and removal until completion", async () => {
		let resolveUpload!: (response: Response) => void;
		fetchMock.mockReturnValueOnce(
			new Promise<Response>((resolve) => {
				resolveUpload = resolve;
			}),
		);
		const onUploadingChange = vi.fn();
		const { container } = render(
			React.createElement(AttachmentUploadField, {
				initialEntries,
				onUploadingChange,
			}),
		);
		expect(onUploadingChange).not.toHaveBeenCalled();

		const { input } = selectFile();
		const removeButton = screen.getByRole<HTMLButtonElement>("button", {
			name: "Remove handbook.pdf",
		});

		expect(screen.getByText("Uploading…")).toBeTruthy();
		expect(input.disabled).toBe(true);
		expect(removeButton.disabled).toBe(true);
		expect(onUploadingChange.mock.calls).toEqual([[true]]);
		fireEvent.click(removeButton);
		expect(submittedAttachments(container)).toHaveLength(2);
		expect(fetchMock).toHaveBeenCalledTimes(1);

		await act(async () => {
			resolveUpload(Response.json({ success: true, asset: uploadedAsset }));
		});

		expect(onUploadingChange.mock.calls).toEqual([[true], [false]]);
		expect(screen.queryByText("Uploading…")).toBeNull();
		expect(input.disabled).toBe(false);
		expect(removeButton.disabled).toBe(false);
		expect(submittedAttachments(container)).toHaveLength(3);
	});

	it("clears an upload error when retrying and adds only the successful upload", async () => {
		fetchMock
			.mockResolvedValueOnce(
				Response.json(
					{ success: false, error: "Please try again" },
					{ status: 503 },
				),
			)
			.mockResolvedValueOnce(
				Response.json({ success: true, asset: uploadedAsset }),
			);
		const { container } = render(React.createElement(AttachmentUploadField));

		selectFile();
		await screen.findByText("Please try again");
		expect(submittedAttachments(container)).toEqual([]);

		selectFile();
		expect(screen.queryByText("Please try again")).toBeNull();
		await screen.findByRole("link", { name: uploadedAsset.originalName });
		expect(submittedAttachments(container)).toEqual([
			{ fileAssetId: uploadedAsset.id, label: uploadedAsset.originalName },
		]);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("counts prepopulated entries toward maxFiles and restores the picker after removal", () => {
		const { container } = render(
			React.createElement(AttachmentUploadField, {
				initialEntries,
				maxFiles: 2,
			}),
		);

		expect(screen.getByText("You can attach at most 2 files.")).toBeTruthy();
		expect(screen.queryByLabelText(pickerLabel)).toBeNull();

		fireEvent.click(
			screen.getByRole("button", { name: "Remove handbook.pdf" }),
		);

		expect(screen.queryByText("You can attach at most 2 files.")).toBeNull();
		expect(screen.getByLabelText<HTMLInputElement>(pickerLabel).disabled).toBe(
			false,
		);
		expect(submittedAttachments(container)).toEqual([
			{ fileAssetId: "existing-schedule", label: "" },
		]);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("hides the picker when a successful upload reaches maxFiles", async () => {
		fetchMock.mockResolvedValueOnce(
			Response.json({ success: true, asset: uploadedAsset }),
		);
		const { container } = render(
			React.createElement(AttachmentUploadField, { maxFiles: 1 }),
		);

		selectFile();

		expect(
			await screen.findByText("You can attach at most 1 files."),
		).toBeTruthy();
		expect(screen.queryByLabelText(pickerLabel)).toBeNull();
		expect(submittedAttachments(container)).toEqual([
			{ fileAssetId: uploadedAsset.id, label: uploadedAsset.originalName },
		]);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("prevents changes while disabled and re-enables controls when enabled", () => {
		const onUploadingChange = vi.fn();
		const { container, rerender } = render(
			React.createElement(AttachmentUploadField, {
				initialEntries,
				disabled: true,
				onUploadingChange,
			}),
		);
		const input = screen.getByLabelText<HTMLInputElement>(pickerLabel);
		const removeButtons = screen.getAllByRole<HTMLButtonElement>("button");

		expect(input.disabled).toBe(true);
		for (const button of removeButtons) {
			expect(button.disabled).toBe(true);
			fireEvent.click(button);
		}
		input.click();
		expect(submittedAttachments(container)).toEqual([
			{ fileAssetId: "existing-handbook", label: "Club handbook" },
			{ fileAssetId: "existing-schedule", label: "" },
		]);
		expect(fetchMock).not.toHaveBeenCalled();
		expect(onUploadingChange).not.toHaveBeenCalled();

		rerender(
			React.createElement(AttachmentUploadField, {
				initialEntries,
				disabled: false,
				onUploadingChange,
			}),
		);
		expect(input.disabled).toBe(false);
		for (const button of removeButtons) expect(button.disabled).toBe(false);
		fireEvent.click(removeButtons[0]);
		expect(submittedAttachments(container)).toEqual([
			{ fileAssetId: "existing-schedule", label: "" },
		]);
	});

	it("remounts without retaining prepopulated or uploaded entries from the previous field", async () => {
		fetchMock.mockResolvedValueOnce(
			Response.json({ success: true, asset: uploadedAsset }),
		);
		const previous = render(
			React.createElement(AttachmentUploadField, { initialEntries }),
		);
		selectFile();
		await waitFor(() => {
			expect(submittedAttachments(previous.container)).toHaveLength(3);
		});

		previous.unmount();
		const next = render(React.createElement(AttachmentUploadField));

		expect(submittedAttachments(next.container)).toEqual([]);
		expect(screen.queryByRole("link")).toBeNull();
		expect(screen.queryByRole("button")).toBeNull();
		expect(screen.getByLabelText<HTMLInputElement>(pickerLabel).disabled).toBe(
			false,
		);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});
