import { createFileRoute, redirect } from "@tanstack/react-router";
import { Images, Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ImageUploadField } from "#/components/content/ImageUploadField.tsx";
import {
	addGalleryPhotoAction,
	createGalleryCollectionAction,
	deleteGalleryPhotoAction,
	getGalleryCollectionsFn,
} from "#/packages/content/server.ts";

export const Route = createFileRoute("/admin/_admin/gallery")({
	beforeLoad: ({ context }) => {
		if (!context.viewer.permissions.includes("MANAGE_CONTENT")) {
			throw redirect({ to: "/admin" });
		}
	},
	component: AdminGallery,
});

interface CollectionPhoto {
	src: string;
	alt: string;
}

interface Collection {
	id: string;
	event: string;
	year: string;
	category: string;
	date: string;
	photos: CollectionPhoto[];
}

function AdminGallery() {
	const [collections, setCollections] = useState<Array<Collection>>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [collectionFormKey, setCollectionFormKey] = useState(0);
	const [photoFormKey, setPhotoFormKey] = useState(0);

	const load = useCallback(async () => {
		const response = await getGalleryCollectionsFn();

		if (!response.success) setError(response.error);
		else setCollections(response.collections as Array<Collection>);

		setIsLoading(false);
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const createCollection = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const form = event.currentTarget;
		const data = new FormData(form);

		setError("");
		setNotice("");
		setIsSubmitting(true);

		const response = await createGalleryCollectionAction({
			data: {
				event: String(data.get("event") ?? ""),
				year: String(data.get("year") ?? ""),
				category: String(data.get("category") ?? ""),
				date: String(data.get("date") ?? "") || undefined,
			},
		});

		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		form.reset();
		setCollectionFormKey((version) => version + 1);
		setNotice(`Collection “${response.collection.event}” created.`);
		await load();
	};

	const addPhoto = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const form = event.currentTarget;
		const data = new FormData(form);

		setError("");
		setNotice("");
		setIsSubmitting(true);

		const response = await addGalleryPhotoAction({
			data: {
				albumId: String(data.get("albumId") ?? ""),
				imageUrl: String(data.get("imageUrl") ?? ""),
				alt: String(data.get("alt") ?? "") || undefined,
			},
		});

		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		form.reset();
		setPhotoFormKey((version) => version + 1);
		setNotice("Photo added to the collection — it is live on the website.");
		await load();
	};

	const removePhoto = async (albumId: string, index: number) => {
		if (!confirm("Remove this photo from the collection?")) return;

		setError("");
		const response = await deleteGalleryPhotoAction({
			data: { albumId, index },
		});

		if (!response.success) {
			setError(response.error);
			return;
		}

		setNotice("Photo removed.");
		await load();
	};

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
				<p className="mt-1 text-sm text-gray-500">
					Collections are the albums shown on the public gallery page. Photos
					added to a collection appear there immediately.
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
				<h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-gray-900">
					<Images className="h-5 w-5 text-red-500" /> New collection
				</h2>
				<p className="mb-4 text-sm text-gray-500">
					Group photos by event, academic year and category.
				</p>
				<form
					key={collectionFormKey}
					onSubmit={(event) => void createCollection(event)}
					className="grid gap-4 md:grid-cols-2"
				>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">
							Collection name
						</span>
						<input
							name="event"
							required
							placeholder="e.g. Inter-house Music Night"
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">
							Academic year
						</span>
						<input
							name="year"
							required
							placeholder="e.g. 2083 BS"
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">
							Category
						</span>
						<input
							name="category"
							required
							placeholder="e.g. Culture"
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">
							Date (optional)
						</span>
						<input
							name="date"
							placeholder="e.g. 14 Magh 2083"
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<div className="md:col-span-2">
						<button
							type="submit"
							disabled={isSubmitting}
							className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
						>
							{isSubmitting ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Plus className="h-4 w-4" />
							)}
							Create collection
						</button>
					</div>
				</form>
			</section>

			<section className="rounded-2xl border border-gray-200 bg-white p-6">
				<h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-gray-900">
					<Plus className="h-5 w-5 text-red-500" /> Add a photo
				</h2>
				<p className="mb-4 text-sm text-gray-500">
					Choose the collection the photo belongs to.
				</p>
				{collections.length === 0 ? (
					<p className="text-sm text-gray-500">
						Create a collection first, then add photos to it.
					</p>
				) : (
					<form
						key={photoFormKey}
						onSubmit={(event) => void addPhoto(event)}
						className="grid gap-4 md:grid-cols-2"
					>
						<label className="text-sm md:col-span-2">
							<span className="mb-1 block font-medium text-gray-700">
								Collection
							</span>
							<select
								name="albumId"
								required
								defaultValue={collections[0]?.id}
								className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
							>
								{collections.map((collection) => (
									<option key={collection.id} value={collection.id}>
										{collection.event} · {collection.year}
									</option>
								))}
							</select>
						</label>
						<ImageUploadField
							name="imageUrl"
							prefix="gallery"
							className="md:col-span-2"
						/>
						<label className="text-sm">
							<span className="mb-1 block font-medium text-gray-700">
								Caption / alt text
							</span>
							<input
								name="alt"
								placeholder="What is happening in this photo?"
								className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
							/>
						</label>
						<div className="flex items-end">
							<button
								type="submit"
								disabled={isSubmitting}
								className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
							>
								{isSubmitting ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Plus className="h-4 w-4" />
								)}
								Add photo
							</button>
						</div>
					</form>
				)}
			</section>

			<section className="space-y-4">
				<h2 className="text-lg font-semibold text-gray-900">Collections</h2>
				{isLoading ? (
					<p className="flex items-center gap-2 text-sm text-gray-500">
						<Loader2 className="h-4 w-4 animate-spin" /> Loading…
					</p>
				) : collections.length === 0 ? (
					<p className="text-sm text-gray-500">No collections yet.</p>
				) : (
					collections.map((collection) => (
						<div
							key={collection.id}
							data-testid={`gallery-collection-${collection.id}`}
							className="rounded-2xl border border-gray-200 bg-white p-6"
						>
							<div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
								<div>
									<h3 className="text-base font-semibold text-gray-900">
										{collection.event}
									</h3>
									<p className="mt-0.5 text-xs text-gray-500">
										{[collection.category, collection.year, collection.date]
											.filter(Boolean)
											.join(" · ")}
									</p>
								</div>
								<span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
									{collection.photos.length} photo
									{collection.photos.length === 1 ? "" : "s"}
								</span>
							</div>

							{collection.photos.length === 0 ? (
								<p className="text-sm text-gray-500">
									No photos in this collection yet.
								</p>
							) : (
								<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
									{collection.photos.map((photo, index) => (
										<li
											key={`${collection.id}-${photo.src}`}
											className="overflow-hidden rounded-xl border border-gray-200"
										>
											<img
												src={photo.src}
												alt={photo.alt || collection.event}
												className="h-40 w-full object-cover"
											/>
											<div className="flex items-center justify-between gap-2 p-3">
												<p className="min-w-0 truncate text-xs text-gray-600">
													{photo.alt || "No caption"}
												</p>
												<button
													type="button"
													onClick={() => void removePhoto(collection.id, index)}
													className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-red-600"
												>
													<Trash2 className="h-3.5 w-3.5" /> Remove
												</button>
											</div>
										</li>
									))}
								</ul>
							)}
						</div>
					))
				)}
			</section>
		</div>
	);
}
