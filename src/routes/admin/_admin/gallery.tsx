import { createFileRoute, redirect } from "@tanstack/react-router";
import { Images, Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ImageUploadField } from "#/components/content/ImageUploadField.tsx";
import {
	createGalleryImageAction,
	deleteGalleryImageAction,
	getGalleryAdminFn,
	updateGalleryImageAction,
} from "#/packages/content/server.ts";

export const Route = createFileRoute("/admin/_admin/gallery")({
	beforeLoad: ({ context }) => {
		if (!context.viewer.permissions.includes("MANAGE_CONTENT")) {
			throw redirect({ to: "/admin" });
		}
	},
	component: AdminGallery,
});

interface ImageRow {
	id: string;
	title: string | null;
	caption: string | null;
	imageUrl: string;
	isPublished: boolean;
	sortOrder: number;
}

function AdminGallery() {
	const [images, setImages] = useState<Array<ImageRow>>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isUploading] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [formVersion, setFormVersion] = useState(0);

	const load = useCallback(async () => {
		const response = await getGalleryAdminFn();

		if (!response.success) setError(response.error);
		else setImages(response.images as Array<ImageRow>);

		setIsLoading(false);
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const submit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isUploading) return;
		setError("");
		setNotice("");
		setIsSubmitting(true);

		const form = event.currentTarget;
		const data = new FormData(form);
		const response = await createGalleryImageAction({
			data: {
				imageUrl: String(data.get("imageUrl") ?? ""),
				title: String(data.get("title") ?? "") || undefined,
				caption: String(data.get("caption") ?? "") || undefined,
				sortOrder: Number(data.get("sortOrder") ?? 0),
			},
		});

		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		form.reset();
		setFormVersion((version) => version + 1);
		setNotice("Photo added to the gallery.");
		await load();
	};

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
				<p className="mt-1 text-sm text-gray-500">
					Photos appear on the public gallery page. Unpublished photos stay
					hidden.
				</p>
			</div>

			{error ? (
				<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					{error}
				</div>
			) : null}
			{notice ? (
				<div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
					{notice}
				</div>
			) : null}

			<section className="rounded-2xl border border-gray-200 bg-white p-6">
				<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
					<Plus className="h-5 w-5 text-red-500" /> Add a photo
				</h2>
				<form
					key={formVersion}
					onSubmit={(event) => void submit(event)}
					className="grid gap-4 md:grid-cols-2"
				>
					<ImageUploadField
						name="imageUrl"
						prefix="gallery"
						className="md:col-span-2"
					/>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">Title</span>
						<input
							name="title"
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">
							Sort order
						</span>
						<input
							type="number"
							name="sortOrder"
							min={0}
							defaultValue={0}
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<label className="text-sm md:col-span-2">
						<span className="mb-1 block font-medium text-gray-700">
							Caption
						</span>
						<input
							name="caption"
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<div className="md:col-span-2">
						<button
							type="submit"
							disabled={isSubmitting || isUploading}
							className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
						>
							{isSubmitting ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Images className="h-4 w-4" />
							)}
							Add photo
						</button>
					</div>
				</form>
			</section>

			<section className="rounded-2xl border border-gray-200 bg-white p-6">
				<h2 className="mb-4 text-lg font-semibold text-gray-900">Photos</h2>
				{isLoading ? (
					<p className="flex items-center gap-2 text-sm text-gray-500">
						<Loader2 className="h-4 w-4 animate-spin" /> Loading…
					</p>
				) : images.length === 0 ? (
					<p className="text-sm text-gray-500">No photos yet.</p>
				) : (
					<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{images.map((image) => (
							<li
								key={image.id}
								className="overflow-hidden rounded-xl border border-gray-200"
							>
								<img
									src={image.imageUrl}
									alt={image.title ?? "Gallery photo"}
									className="h-40 w-full object-cover"
								/>
								<div className="space-y-2 p-3">
									<p className="text-sm font-medium text-gray-900">
										{image.title ?? "Untitled"}
									</p>
									{image.caption ? (
										<p className="text-xs text-gray-500">{image.caption}</p>
									) : null}
									<div className="flex items-center justify-between gap-2">
										<button
											type="button"
											onClick={async () => {
												const response = await updateGalleryImageAction({
													data: {
														id: image.id,
														isPublished: !image.isPublished,
													},
												});
												if (!response.success) setError(response.error);
												else await load();
											}}
											className={
												image.isPublished
													? "rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700"
													: "rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600"
											}
										>
											{image.isPublished ? "Published" : "Hidden"}
										</button>
										<button
											type="button"
											onClick={async () => {
												if (!confirm("Delete this photo?")) return;
												const response = await deleteGalleryImageAction({
													data: { id: image.id },
												});
												if (!response.success) setError(response.error);
												else await load();
											}}
											className="inline-flex items-center gap-1 text-xs font-medium text-red-600"
										>
											<Trash2 className="h-3.5 w-3.5" /> Delete
										</button>
									</div>
								</div>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
