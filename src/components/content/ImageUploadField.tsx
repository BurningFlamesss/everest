import { FileImage, Loader2, UploadCloud, X } from "lucide-react";
import { useState } from "react";
import { cn } from "#/lib/utils.ts";
import { IMAGE_ACCEPT, MAX_IMAGE_MB } from "#/packages/storage/policy.ts";

interface ImageUploadFieldProps {
	name: string;
	label?: string;
	defaultUrl?: string | null;
	prefix?: string;
	className?: string;
}

/**
 * Uploads an image to `/api/uploads` and keeps the returned URL in a hidden
 * input so it can be submitted with the surrounding form.
 */
export function ImageUploadField({
	name,
	label = "Cover image",
	defaultUrl,
	prefix = "content",
	className,
}: ImageUploadFieldProps) {
	const [url, setUrl] = useState(defaultUrl ?? "");
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState("");

	const upload = async (file: File) => {
		setError("");
		setIsUploading(true);

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
				asset?: { url: string };
				error?: string;
			};

			if (!response.ok || !result.success || !result.asset) {
				setError(result.error ?? "Could not upload this image.");
				return;
			}

			setUrl(result.asset.url);
		} catch (uploadError) {
			setError(
				uploadError instanceof Error
					? uploadError.message
					: "Could not upload this image.",
			);
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div className={cn("text-sm", className)}>
			<span className="mb-1 block font-medium text-gray-700">{label}</span>
			<input type="hidden" name={name} value={url} />

			{url ? (
				<div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
					<img
						src={url}
						alt="Selected cover"
						className="h-40 w-full object-cover"
					/>
					<button
						type="button"
						onClick={() => setUrl("")}
						className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-gray-700 shadow hover:bg-white"
						aria-label="Remove image"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
			) : (
				<label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center hover:border-red-300 hover:bg-red-50/40">
					{isUploading ? (
						<Loader2 className="h-6 w-6 animate-spin text-red-500" />
					) : (
						<UploadCloud className="h-6 w-6 text-gray-400" />
					)}
					<span className="text-xs font-medium text-gray-600">
						{isUploading
							? "Uploading…"
							: `Choose an image (max ${MAX_IMAGE_MB} MB)`}
					</span>
					<span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
						<FileImage className="h-3 w-3" /> PNG, JPEG, WebP or GIF
					</span>
					<input
						type="file"
						accept={IMAGE_ACCEPT}
						className="sr-only"
						disabled={isUploading}
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
