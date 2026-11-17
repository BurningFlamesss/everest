import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	AlertTriangle,
	CheckCircle2,
	ImagePlus,
	Images,
	Loader2,
	Plus,
	Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { EmptyState } from "#/components/common/EmptyState";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { PanelSkeleton } from "#/components/common/Skeletons";
import { ImageUploadField } from "#/components/content/ImageUploadField.tsx";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
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
	const [pendingPhoto, setPendingPhoto] = useState<{
		albumId: string;
		index: number;
	} | null>(null);

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
		setPendingPhoto(null);
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
		<div data-testid="gallery-page">
			<PageHeader
				eyebrow="Website"
				title="Gallery"
				description="Collections are the albums shown on the public gallery page. Photos added to a collection appear there immediately."
				testId="gallery-page-header"
			/>

			<div className="space-y-5">
				{error ? (
					<div
						className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
						data-testid="gallery-error-banner"
					>
						<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
						<p className="min-w-0 break-words">{error}</p>
					</div>
				) : null}
				{notice ? (
					<div
						className="flex items-start gap-2.5 rounded-lg border border-success/20 bg-success/10 p-4 text-sm text-success"
						data-testid="gallery-notice-banner"
					>
						<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
						<p className="min-w-0 break-words">{notice}</p>
					</div>
				) : null}

				<Panel
					title="New collection"
					description="Group photos by event, academic year and category."
					testId="gallery-new-collection-panel"
				>
					<form
						key={collectionFormKey}
						onSubmit={(event) => void createCollection(event)}
						className="grid gap-4 md:grid-cols-2"
					>
						<div className="space-y-2">
							<Label htmlFor="gallery-collection-event" className="text-xs">
								Collection name
							</Label>
							<Input
								id="gallery-collection-event"
								name="event"
								required
								placeholder="e.g. Inter-house Music Night"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="gallery-collection-year" className="text-xs">
								Academic year
							</Label>
							<Input
								id="gallery-collection-year"
								name="year"
								required
								placeholder="e.g. 2083 BS"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="gallery-collection-category" className="text-xs">
								Category
							</Label>
							<Input
								id="gallery-collection-category"
								name="category"
								required
								placeholder="e.g. Culture"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="gallery-collection-date" className="text-xs">
								Date (optional)
							</Label>
							<Input
								id="gallery-collection-date"
								name="date"
								placeholder="e.g. 14 Magh 2083"
							/>
						</div>
						<div className="md:col-span-2">
							<Button
								type="submit"
								size="sm"
								className="gap-1.5"
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<Loader2 className="h-3.5 w-3.5 animate-spin" />
								) : (
									<Plus className="h-3.5 w-3.5" />
								)}
								Create collection
							</Button>
						</div>
					</form>
				</Panel>

				<Panel
					title="Add a photo"
					description="Choose the collection the photo belongs to."
					testId="gallery-add-photo-panel"
				>
					{collections.length === 0 ? (
						<EmptyState
							compact
							icon={Images}
							title="No collections yet"
							description="Create a collection first, then add photos to it."
							testId="gallery-add-photo-empty"
						/>
					) : (
						<form
							key={photoFormKey}
							onSubmit={(event) => void addPhoto(event)}
							className="grid gap-4 md:grid-cols-2"
						>
							<div className="space-y-2 md:col-span-2">
								<Label htmlFor="gallery-photo-album" className="text-xs">
									Collection
								</Label>
								<select
									id="gallery-photo-album"
									name="albumId"
									required
									defaultValue={collections[0]?.id}
									className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
								>
									{collections.map((collection) => (
										<option key={collection.id} value={collection.id}>
											{collection.event} · {collection.year}
										</option>
									))}
								</select>
							</div>
							<ImageUploadField
								name="imageUrl"
								prefix="gallery"
								className="md:col-span-2"
							/>
							<div className="space-y-2">
								<Label htmlFor="gallery-photo-alt" className="text-xs">
									Caption / alt text
								</Label>
								<Input
									id="gallery-photo-alt"
									name="alt"
									placeholder="What is happening in this photo?"
								/>
							</div>
							<div className="flex items-end">
								<Button
									type="submit"
									size="sm"
									className="gap-1.5"
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Plus className="h-3.5 w-3.5" />
									)}
									Add photo
								</Button>
							</div>
						</form>
					)}
				</Panel>

				<section className="space-y-4">
					<h2 className="font-display text-sm font-semibold text-foreground">
						Collections
					</h2>
					{isLoading ? (
						<div
							className="space-y-4"
							data-testid="gallery-collections-loading"
						>
							<PanelSkeleton height="h-44" />
							<PanelSkeleton height="h-44" />
						</div>
					) : collections.length === 0 ? (
						<div className="panel">
							<EmptyState
								icon={Images}
								title="No collections yet"
								description="Create a collection above — photos added to it appear on the public gallery immediately."
								testId="gallery-collections-empty"
							/>
						</div>
					) : (
						collections.map((collection) => (
							<Panel
								key={collection.id}
								title={collection.event}
								description={[
									collection.category,
									collection.year,
									collection.date,
								]
									.filter(Boolean)
									.join(" · ")}
								actions={
									<span className="num rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
										{collection.photos.length} photo
										{collection.photos.length === 1 ? "" : "s"}
									</span>
								}
								testId={`gallery-collection-${collection.id}`}
							>
								{collection.photos.length === 0 ? (
									<EmptyState
										compact
										icon={ImagePlus}
										title="No photos in this collection yet"
										description="Add the first photo with the form above — it goes live on the website straight away."
										testId={`gallery-collection-empty-${collection.id}`}
									/>
								) : (
									<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
										{collection.photos.map((photo, index) => (
											<li
												key={`${collection.id}-${photo.src}`}
												className="overflow-hidden rounded-lg border border-hairline bg-surface-1 transition-colors duration-150 hover:border-primary/35"
											>
												<img
													src={photo.src}
													alt={photo.alt || collection.event}
													className="h-40 w-full object-cover"
												/>
												<div className="flex items-center justify-between gap-2 p-3">
													<p className="min-w-0 truncate text-xs text-muted-foreground">
														{photo.alt || "No caption"}
													</p>
													<Button
														variant="ghost"
														size="sm"
														className="h-7 shrink-0 gap-1 px-2 text-xs text-destructive hover:text-destructive"
														onClick={() =>
															setPendingPhoto({
																albumId: collection.id,
																index,
															})
														}
													>
														<Trash2 className="h-3.5 w-3.5" /> Remove
													</Button>
												</div>
											</li>
										))}
									</ul>
								)}
							</Panel>
						))
					)}
				</section>
			</div>

			<ConfirmDialog
				open={pendingPhoto !== null}
				onOpenChange={(open) => !open && setPendingPhoto(null)}
				title="Remove this photo?"
				description="The photo will be removed from the collection and the public gallery. This cannot be undone."
				confirmLabel="Remove photo"
				destructive
				onConfirm={() => {
					if (!pendingPhoto) return;
					void removePhoto(pendingPhoto.albumId, pendingPhoto.index);
				}}
				testId="gallery-remove-photo-confirm"
			/>
		</div>
	);
}
