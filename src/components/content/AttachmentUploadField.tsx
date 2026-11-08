import { FileText, Loader2, Paperclip, UploadCloud, X } from "lucide-react";
import { useState } from "react";
import { cn } from "#/lib/utils.ts";
import { DOCUMENT_ACCEPT, MAX_DOCUMENT_MB } from "#/packages/storage/policy.ts";

export interface AttachmentEntry {
	fileAssetId: string;
	url: string;
	name: string;
	label: string;
}

interface AttachmentUploadFieldProps {
	name?: string;
	label?: string;
	prefix?: string;
	className?: string;
	maxFiles?: number;
	initialEntries?: Array<AttachmentEntry>;
	disabled?: boolean;
	onUploadingChange?: (isUploading: boolean) => void;
}

/**
 * Uploads documents through `/api/uploads` and keeps the resulting asset ids
 * in a hidden JSON input so they can be submitted with the surrounding form.
 */
export function AttachmentUploadField({
	name = "attachments",
	label = "Attachments",
	prefix = "attachments",
	className,
	maxFiles = 10,
	initialEntries = [],
	disabled = false,
	onUploadingChange,
}: AttachmentUploadFieldProps) {
	const [entries, setEntries] =
		useState<Array<AttachmentEntry>>(initialEntries);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState("");

	const upload = async (file: File) => {
		setError("");
		setIsUploading(true);
		onUploadingChange?.(true);

		try {
			const body = new FormData();
			body.set("file", file);
			body.set("prefix", prefix);

			const response = await fetch("/api/uploads", {
				method: "POST",
				body,
			});
			const result = (await response.json()) as {
				success: boolean;
				asset?: {
					id: string;
					url: string;
					originalName: string;
				};
				error?: string;
			};

			const asset = result.asset;

			if (!response.ok || !result.success || !asset) {
				setError(result.error ?? "Could not upload this file.");
				return;
			}

			setEntries((current) => [
				...current,
				{
					fileAssetId: asset.id,
					url: asset.url,
					name: asset.originalName,
					label: asset.originalName,
				},
			]);
		} catch (uploadError) {
			setError(
				uploadError instanceof Error
					? uploadError.message
					: "Could not upload this file.",
			);
		} finally {
			setIsUploading(false);
			onUploadingChange?.(false);
		}
	};

	const remove = (fileAssetId: string) => {
		setEntries((current) =>
			current.filter((entry) => entry.fileAssetId !== fileAssetId),
		);
	};

	return (
		<div className={cn("text-sm", className)}>
			<span className="mb-1 block font-medium text-gray-700">{label}</span>
			<input
				type="hidden"
				name={name}
				value={JSON.stringify(
					entries.map((entry) => ({
						fileAssetId: entry.fileAssetId,
						label: entry.label,
					})),
				)}
			/>

			{entries.length > 0 ? (
				<ul className="mb-2 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
					{entries.map((entry) => (
						<li
							key={entry.fileAssetId}
							className="flex items-center gap-2 px-3 py-2"
						>
							<FileText className="h-4 w-4 shrink-0 text-gray-400" />
							<a
								href={entry.url}
								target="_blank"
								rel="noreferrer"
								className="min-w-0 flex-1 truncate text-xs font-medium text-gray-700 hover:text-red-600"
							>
								{entry.label || entry.name}
							</a>
							<button
								type="button"
								onClick={() => remove(entry.fileAssetId)}
								disabled={disabled || isUploading}
								className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600"
								aria-label={`Remove ${entry.name}`}
							>
								<X className="h-3.5 w-3.5" />
							</button>
						</li>
					))}
				</ul>
			) : null}

			{entries.length >= maxFiles ? (
				<p className="text-xs text-gray-500">
					You can attach at most {maxFiles} files.
				</p>
			) : (
				<label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-center hover:border-red-300 hover:bg-red-50/40">
					{isUploading ? (
						<Loader2 className="h-4 w-4 animate-spin text-red-500" />
					) : (
						<UploadCloud className="h-4 w-4 text-gray-400" />
					)}
					<span className="text-xs font-medium text-gray-600">
						{isUploading
							? "Uploading…"
							: "Add a PDF, Word, Excel, CSV or text file"}
					</span>
					<span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
						<Paperclip className="h-3 w-3" /> max {MAX_DOCUMENT_MB} MB each
					</span>
					<input
						type="file"
						accept={DOCUMENT_ACCEPT}
						className="sr-only"
						disabled={disabled || isUploading}
						onChange={(event) => {
							const file = event.target.files?.[0];
							if (file) void upload(file);
							event.target.value = "";
						}}
					/>
				</label>
			)}

			{error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
		</div>
	);
}
