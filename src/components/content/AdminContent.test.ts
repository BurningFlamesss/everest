// @vitest-environment jsdom

import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route } from "#/routes/admin/_admin/content.tsx";

const mocks = vi.hoisted(() => ({
	getContentAdminDataFn: vi.fn(),
	createClubAction: vi.fn(),
	updateClubAction: vi.fn(),
	deleteClubAction: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
	createFileRoute: () => (options: unknown) => ({ options }),
}));

vi.mock("#/packages/content/server.ts", () => ({
	...mocks,
	collectOrphanedAssetsAction: vi.fn(),
	createEventAction: vi.fn(),
	createNoticeAction: vi.fn(),
	deleteEventAction: vi.fn(),
	deleteNoticeAction: vi.fn(),
	updateEventAction: vi.fn(),
	updateNoticeAction: vi.fn(),
}));

const fetchMock = vi.fn<typeof fetch>();
const pickerLabel = /Add a PDF, Word, Excel, CSV or text file/;
const clubs = [
	{
		id: "robotics",
		name: "Robotics Club",
		description: "Build robots",
		meetingSchedule: "Fridays",
		coverImage: null,
		isActive: true,
		attachments: [
			{
				id: "handbook-link",
				fileAssetId: "handbook",
				label: "Club handbook",
				fileAsset: {
					url: "/uploads/handbook.pdf",
					originalName: "handbook.pdf",
				},
			},
			{
				id: "schedule-link",
				fileAssetId: "schedule",
				label: null,
				fileAsset: {
					url: "/uploads/schedule.csv",
					originalName: `${"schedule".repeat(26)}.csv`,
				},
			},
		],
	},
	{
		id: "art",
		name: "Art Club",
		description: null,
		meetingSchedule: null,
		coverImage: null,
		isActive: false,
		attachments: [],
	},
];
const uploadedAsset = {
	id: "rules",
	url: "/uploads/rules.pdf",
	originalName: "rules.pdf",
};

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((resolvePromise) => {
		resolve = resolvePromise;
	});
	return { promise, resolve };
}

async function openClubs() {
	render(React.createElement(Route.options.component as React.ComponentType));
	await waitFor(() => expect(screen.queryByText("Loading…")).toBeNull());
	fireEvent.click(screen.getByRole("button", { name: "clubs" }));
}

function clubRow(name = "Robotics Club") {
	const row = screen.getByText(name, { selector: "p" }).closest("li");
	if (!row) throw new Error(`Missing club row: ${name}`);
	return within(row);
}

function creationForm() {
	const form = screen.getByRole("button", { name: "Save" }).closest("form");
	if (!form) throw new Error("Missing creation form");
	return form;
}

function attachmentForm() {
	const form = screen
		.getByRole("button", { name: "Save attachments" })
		.closest("form");
	if (!form) throw new Error("Missing attachment form");
	return form;
}

function selectDocument(form: HTMLFormElement) {
	fireEvent.change(within(form).getByLabelText(pickerLabel), {
		target: {
			files: [new File(["rules"], "rules.pdf", { type: "application/pdf" })],
		},
	});
}

beforeEach(() => {
	vi.resetAllMocks();
	vi.stubGlobal("fetch", fetchMock);
	vi.stubGlobal(
		"confirm",
		vi.fn(() => true),
	);
	mocks.getContentAdminDataFn.mockResolvedValue({
		success: true,
		notices: [],
		events: [],
		clubs,
	});
	mocks.createClubAction.mockResolvedValue({ success: true });
	mocks.updateClubAction.mockResolvedValue({ success: true });
	mocks.deleteClubAction.mockResolvedValue({ success: true });
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe("admin club attachments", () => {
	it("creates a club with uploaded documents and resets the upload field after success", async () => {
		fetchMock.mockResolvedValueOnce(
			Response.json({ success: true, asset: uploadedAsset }),
		);
		await openClubs();
		const form = creationForm();
		fireEvent.change(within(form).getByLabelText("Name"), {
			target: { value: "Chess Club" },
		});
		selectDocument(form);
		await within(form).findByRole("link", { name: "rules.pdf" });

		fireEvent.submit(form);

		await screen.findByText("Club created.");
		expect(mocks.createClubAction).toHaveBeenCalledExactlyOnceWith({
			data: expect.objectContaining({
				name: "Chess Club",
				isActive: true,
				attachments: [{ fileAssetId: "rules", label: "rules.pdf" }],
			}),
		});
		expect(within(creationForm()).queryByRole("link")).toBeNull();
		expect(
			within(creationForm()).getByLabelText<HTMLInputElement>("Name").value,
		).toBe("");
	});

	it("does not submit or switch tabs while a creation upload is pending", async () => {
		const upload = deferred<Response>();
		fetchMock.mockReturnValueOnce(upload.promise);
		await openClubs();
		const form = creationForm();
		selectDocument(form);

		expect(
			within(form).getByRole<HTMLButtonElement>("button", { name: "Save" })
				.disabled,
		).toBe(true);
		expect(
			screen.getByRole<HTMLButtonElement>("button", { name: "notices" })
				.disabled,
		).toBe(true);
		fireEvent.submit(form);
		expect(mocks.createClubAction).not.toHaveBeenCalled();

		await act(async () =>
			upload.resolve(Response.json({ success: true, asset: uploadedAsset })),
		);
		expect(
			within(form).getByRole<HTMLButtonElement>("button", { name: "Save" })
				.disabled,
		).toBe(false);
	});

	it("preserves custom labels and leaves absent labels absent when saving existing attachments", async () => {
		await openClubs();
		fireEvent.click(
			clubRow().getByRole("button", { name: "Edit attachments" }),
		);
		const form = attachmentForm();
		expect(
			within(form)
				.getByRole("link", { name: "Club handbook" })
				.getAttribute("href"),
		).toBe("/uploads/handbook.pdf");
		expect(
			within(form).getByRole("link", {
				name: clubs[0].attachments[1].fileAsset.originalName,
			}),
		).toBeTruthy();

		fireEvent.submit(form);

		await screen.findByText("Club attachments updated.");
		expect(mocks.updateClubAction).toHaveBeenCalledExactlyOnceWith({
			data: {
				id: "robotics",
				attachments: [
					{ fileAssetId: "handbook", label: "Club handbook" },
					{ fileAssetId: "schedule" },
				],
			},
		});
	});

	it("can replace every existing document without deleting uploaded assets", async () => {
		fetchMock.mockResolvedValueOnce(
			Response.json({ success: true, asset: uploadedAsset }),
		);
		await openClubs();
		fireEvent.click(
			clubRow().getByRole("button", { name: "Edit attachments" }),
		);
		const form = attachmentForm();
		for (const button of within(form).getAllByRole("button", {
			name: /^Remove /,
		}))
			fireEvent.click(button);
		selectDocument(form);
		await within(form).findByRole("link", { name: "rules.pdf" });

		fireEvent.submit(form);

		await screen.findByText("Club attachments updated.");
		expect(mocks.updateClubAction).toHaveBeenCalledExactlyOnceWith({
			data: {
				id: "robotics",
				attachments: [{ fileAssetId: "rules", label: "rules.pdf" }],
			},
		});
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(fetchMock.mock.calls[0][1]?.method).toBe("POST");
	});

	it("sends an explicit empty array when all attachments are removed", async () => {
		await openClubs();
		fireEvent.click(
			clubRow().getByRole("button", { name: "Edit attachments" }),
		);
		const form = attachmentForm();
		for (const button of within(form).getAllByRole("button", {
			name: /^Remove /,
		}))
			fireEvent.click(button);
		fireEvent.submit(form);

		await screen.findByText("Club attachments updated.");
		expect(mocks.updateClubAction).toHaveBeenCalledExactlyOnceWith({
			data: { id: "robotics", attachments: [] },
		});
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it.each([
		"upload",
		"save",
	])("disables conflicting list actions during an attachment %s", async (pendingOperation) => {
		const upload = deferred<Response>();
		const save = deferred<{ success: boolean }>();
		fetchMock.mockReturnValueOnce(upload.promise);
		mocks.updateClubAction.mockReturnValueOnce(save.promise);
		await openClubs();
		fireEvent.click(
			clubRow().getByRole("button", { name: "Edit attachments" }),
		);
		const form = attachmentForm();
		if (pendingOperation === "upload") selectDocument(form);
		else fireEvent.submit(form);

		const pendingButtons = [
			clubRow().getByRole<HTMLButtonElement>("button", { name: "Active" }),
			clubRow().getByRole<HTMLButtonElement>("button", { name: "Delete" }),
			clubRow("Art Club").getByRole<HTMLButtonElement>("button", {
				name: "Edit attachments",
			}),
		];
		const disabled = pendingButtons.map((button) => button.disabled);
		for (const button of pendingButtons) fireEvent.click(button);
		expect(mocks.deleteClubAction).not.toHaveBeenCalled();
		expect(mocks.updateClubAction).toHaveBeenCalledTimes(
			pendingOperation === "save" ? 1 : 0,
		);
		expect(
			screen.getByRole("heading", { name: "Attachments for Robotics Club" }),
		).toBeTruthy();
		await act(async () => {
			upload.resolve(Response.json({ success: true, asset: uploadedAsset }));
			save.resolve({ success: true });
		});
		expect(disabled).toEqual([true, true, true]);
	});

	it("keeps the editor and its draft after a failed save so the user can retry", async () => {
		mocks.updateClubAction.mockResolvedValueOnce({
			success: false,
			error: "Could not save attachments",
		});
		await openClubs();
		fireEvent.click(
			clubRow().getByRole("button", { name: "Edit attachments" }),
		);
		const form = attachmentForm();
		fireEvent.click(
			within(form).getByRole("button", { name: "Remove handbook.pdf" }),
		);
		fireEvent.submit(form);

		await screen.findByText("Could not save attachments");
		expect(
			within(form).queryByRole("link", { name: "Club handbook" }),
		).toBeNull();
		expect(within(form).getAllByRole("link")).toHaveLength(1);
		expect(
			within(form).getByRole<HTMLButtonElement>("button", {
				name: "Save attachments",
			}).disabled,
		).toBe(false);
		fireEvent.submit(form);
		await screen.findByText("Club attachments updated.");
		expect(mocks.updateClubAction).toHaveBeenCalledTimes(2);
	});

	it("cancels local edits and does not carry one club's draft into another editor", async () => {
		await openClubs();
		fireEvent.click(
			clubRow().getByRole("button", { name: "Edit attachments" }),
		);
		fireEvent.click(
			within(attachmentForm()).getByRole("button", {
				name: "Remove handbook.pdf",
			}),
		);
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
		fireEvent.click(
			clubRow("Art Club").getByRole("button", { name: "Edit attachments" }),
		);
		expect(within(attachmentForm()).queryByRole("link")).toBeNull();
		fireEvent.click(
			clubRow().getByRole("button", { name: "Edit attachments" }),
		);
		expect(within(attachmentForm()).getAllByRole("link")).toHaveLength(2);
		expect(mocks.updateClubAction).not.toHaveBeenCalled();
	});

	it("closes the attachment editor when its club is deleted", async () => {
		await openClubs();
		fireEvent.click(
			clubRow().getByRole("button", { name: "Edit attachments" }),
		);
		fireEvent.click(clubRow().getByRole("button", { name: "Delete" }));

		await waitFor(() =>
			expect(mocks.getContentAdminDataFn).toHaveBeenCalledTimes(2),
		);
		expect(mocks.deleteClubAction).toHaveBeenCalledExactlyOnceWith({
			data: { id: "robotics" },
		});
		expect(
			screen.queryByRole("button", { name: "Save attachments" }),
		).toBeNull();
	});
});
