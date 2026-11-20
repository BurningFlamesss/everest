import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	DoorOpen,
	GalleryVerticalEnd,
	Pencil,
	Plus,
	Trash2,
	Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "#/components/common/EmptyState";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { PanelSkeleton } from "#/components/common/Skeletons";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import {
	createClassAction,
	createClassroomAction,
	deleteClassAction,
	deleteClassroomAction,
	getAcademicsDataFn,
	updateClassAction,
	updateClassroomAction,
} from "#/packages/academics/server.ts";
import { useAuth } from "#/providers/AuthProvider";

interface ClassRow {
	id: string;
	name: string;
	grade: string;
	section: string;
	roomNo: string | null;
	capacity: number;
	academicYear: string | null;
	classTeacher: { id: string; user: { name: string } } | null;
	_count: { students: number };
}

interface RoomRow {
	id: string;
	name: string;
	building: string | null;
	floor: string | null;
	capacity: number | null;
	isActive: boolean;
	_count: { courses: number };
}

interface StaffRow {
	id: string;
	designation: string;
	user: { name: string };
}

export default function ClassesPage() {
	const { can } = useAuth();
	const canManage = can("classes.manage");
	const qc = useQueryClient();
	const [classOpen, setClassOpen] = useState(false);
	const [roomOpen, setRoomOpen] = useState(false);
	const [editingClass, setEditingClass] = useState<ClassRow | null>(null);
	const [editingRoom, setEditingRoom] = useState<RoomRow | null>(null);
	const [classForm, setClassForm] = useState({
		grade: "Grade 6",
		section: "A",
		roomNo: "",
		capacity: 40,
		classTeacherId: "",
		academicYear: "",
	});
	const [roomForm, setRoomForm] = useState({
		name: "",
		building: "Main Block",
		capacity: 40,
	});

	const { data, isLoading } = useQuery({
		queryKey: ["academics-overview"],
		queryFn: () => getAcademicsDataFn(),
	});

	const classes = (data?.success ? data.classes : []) as ClassRow[];
	const rooms = (data?.success ? data.classrooms : []) as RoomRow[];
	const staff = (data?.success ? data.staff : []) as StaffRow[];

	const refresh = () => {
		void qc.invalidateQueries({ queryKey: ["academics-overview"] });
		void qc.invalidateQueries({ queryKey: ["timetable"] });
	};

	const createClass = useMutation({
		mutationFn: () =>
			createClassAction({
				data: {
					grade: classForm.grade,
					section: classForm.section,
					roomNo: classForm.roomNo || undefined,
					capacity: Number(classForm.capacity) || 40,
					classTeacherId: classForm.classTeacherId || null,
					academicYear: classForm.academicYear || undefined,
				},
			}),
		onSuccess: (response) => {
			if (!response.success) {
				toast.error(response.error);
				return;
			}
			toast.success("Class created");
			setClassOpen(false);
			refresh();
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const openCreateClass = () => {
		setEditingClass(null);
		setClassForm({
			grade: "Grade 6",
			section: "A",
			roomNo: "",
			capacity: 40,
			classTeacherId: "",
			academicYear: "",
		});
		setClassOpen(true);
	};

	const openEditClass = (cls: ClassRow) => {
		setEditingClass(cls);
		setClassForm({
			grade: cls.grade,
			section: cls.section,
			roomNo: cls.roomNo ?? "",
			capacity: cls.capacity,
			classTeacherId: cls.classTeacher?.id ?? "",
			academicYear: cls.academicYear ?? "",
		});
		setClassOpen(true);
	};

	const updateClass = useMutation({
		mutationFn: () => {
			if (!editingClass) throw new Error("CLASS_NOT_SELECTED");
			return updateClassAction({
				data: {
					id: editingClass.id,
					grade: classForm.grade,
					section: classForm.section,
					roomNo: classForm.roomNo,
					capacity: Number(classForm.capacity) || 40,
					classTeacherId: classForm.classTeacherId || null,
					academicYear: classForm.academicYear,
				},
			});
		},
		onSuccess: (response) => {
			if (!response.success) {
				toast.error(response.error);
				return;
			}
			toast.success("Class updated");
			setClassOpen(false);
			setEditingClass(null);
			refresh();
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const removeClass = useMutation({
		mutationFn: (id: string) => deleteClassAction({ data: { id } }),
		onSuccess: (response) => {
			if (!response.success) {
				toast.error(response.error);
				return;
			}
			toast.success("Class removed");
			refresh();
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const createRoom = useMutation({
		mutationFn: () =>
			createClassroomAction({
				data: {
					name: roomForm.name,
					building: roomForm.building,
					capacity: Number(roomForm.capacity) || null,
					isActive: true,
				},
			}),
		onSuccess: (response) => {
			if (!response.success) {
				toast.error(response.error);
				return;
			}
			toast.success("Room added");
			setRoomOpen(false);
			setRoomForm({ name: "", building: "Main Block", capacity: 40 });
			refresh();
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const openCreateRoom = () => {
		setEditingRoom(null);
		setRoomForm({ name: "", building: "Main Block", capacity: 40 });
		setRoomOpen(true);
	};

	const openEditRoom = (room: RoomRow) => {
		setEditingRoom(room);
		setRoomForm({
			name: room.name,
			building: room.building ?? "",
			capacity: room.capacity ?? 40,
		});
		setRoomOpen(true);
	};

	const updateRoom = useMutation({
		mutationFn: () => {
			if (!editingRoom) throw new Error("ROOM_NOT_SELECTED");
			return updateClassroomAction({
				data: {
					id: editingRoom.id,
					name: roomForm.name,
					building: roomForm.building,
					capacity: Number(roomForm.capacity) || null,
					isActive: true,
				},
			});
		},
		onSuccess: (response) => {
			if (!response.success) {
				toast.error(response.error);
				return;
			}
			toast.success("Room updated");
			setRoomOpen(false);
			setEditingRoom(null);
			refresh();
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const removeRoom = useMutation({
		mutationFn: (id: string) => deleteClassroomAction({ data: { id } }),
		onSuccess: (response) => {
			if (!response.success) {
				toast.error(response.error);
				return;
			}
			toast.success("Room removed");
			refresh();
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const grouped = classes.reduce<Record<string, ClassRow[]>>((acc, cls) => {
		acc[cls.grade] = acc[cls.grade] ? [...acc[cls.grade], cls] : [cls];
		return acc;
	}, {});

	return (
		<div data-testid="classes-page" className="space-y-5">
			<PageHeader
				eyebrow="Academics"
				title="Classes & Rooms"
				description="Classes are student groups; rooms are physical spaces. Manage both here, then assign them in the timetable."
				meta={
					!isLoading ? (
						<>
							<span>{classes.length} classes</span>
							<span>{rooms.length} rooms</span>
						</>
					) : undefined
				}
				actions={
					canManage ? (
						<div className="flex flex-wrap gap-2">
							<Button
								variant="outline"
								size="sm"
								className="gap-1.5"
								onClick={openCreateRoom}
							>
								<DoorOpen className="h-3.5 w-3.5" /> Add room
							</Button>
							<Button size="sm" className="gap-1.5" onClick={openCreateClass}>
								<Plus className="h-3.5 w-3.5" /> New class
							</Button>
						</div>
					) : null
				}
			/>

			{isLoading ? (
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{[0, 1, 2].map((i) => (
						<PanelSkeleton key={i} height="h-24" />
					))}
				</div>
			) : classes.length === 0 ? (
				<div className="panel">
					<EmptyState
						icon={GalleryVerticalEnd}
						title="No classes yet"
						description="Create a class, choose its room, and it becomes available in the timetable."
						primaryLabel={canManage ? "New class" : undefined}
						onPrimary={canManage ? openCreateClass : undefined}
					/>
				</div>
			) : (
				<div className="space-y-6">
					{Object.entries(grouped).map(([grade, group]) => (
						<section key={grade}>
							<div className="mb-2.5 flex items-center gap-3">
								<h2 className="font-display text-sm font-semibold text-foreground">
									{grade}
								</h2>
								<span className="h-px flex-1 bg-hairline" />
								<span className="num text-xs text-muted-foreground">
									{group.reduce((sum, cls) => sum + cls._count.students, 0)}{" "}
									students
								</span>
							</div>
							<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
								{group.map((cls) => (
									<div key={cls.id} className="panel group p-4">
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0">
												<p className="font-display text-sm font-semibold text-foreground">
													{cls.name}
												</p>
												<p className="num mt-0.5 text-xs text-muted-foreground">
													{cls.roomNo
														? `Room ${cls.roomNo}`
														: "No room assigned"}
												</p>
											</div>
											{canManage ? (
												<div className="flex items-center gap-1">
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7"
														aria-label={`Edit ${cls.name}`}
														onClick={() => openEditClass(cls)}
													>
														<Pencil className="h-3.5 w-3.5" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7 text-destructive"
														aria-label={`Delete ${cls.name}`}
														onClick={() => removeClass.mutate(cls.id)}
														disabled={removeClass.isPending}
													>
														<Trash2 className="h-3.5 w-3.5" />
													</Button>
												</div>
											) : null}
										</div>
										<div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
											<Users className="h-3.5 w-3.5" />
											{cls._count.students} / {cls.capacity}
											<span className="mx-1">·</span>
											{cls.classTeacher?.user.name ?? "No class teacher"}
										</div>
									</div>
								))}
							</div>
						</section>
					))}
				</div>
			)}

			<Panel
				title="Rooms"
				description="Physical rooms used by classes and the timetable."
				bodyClassName="p-0"
			>
				{rooms.length === 0 ? (
					<EmptyState
						icon={DoorOpen}
						title="No rooms yet"
						description="Add a room, then choose it when creating a class or timetable slot."
						primaryLabel={canManage ? "Add room" : undefined}
						onPrimary={canManage ? openCreateRoom : undefined}
					/>
				) : (
					<ul className="divide-y divide-hairline">
						{rooms.map((room) => (
							<li
								key={room.id}
								className="flex flex-wrap items-center gap-3 px-5 py-3"
							>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium text-foreground">
										{room.name}
									</p>
									<p className="text-xs text-muted-foreground">
										{[
											room.building,
											room.floor,
											room.capacity && `${room.capacity} seats`,
										]
											.filter(Boolean)
											.join(" · ") || "No location details"}
									</p>
								</div>
								{canManage ? (
									<div className="flex items-center gap-1">
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7"
											aria-label={`Edit ${room.name}`}
											onClick={() => openEditRoom(room)}
										>
											<Pencil className="h-3.5 w-3.5" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7 text-destructive"
											aria-label={`Delete ${room.name}`}
											onClick={() => removeRoom.mutate(room.id)}
											disabled={removeRoom.isPending}
										>
											<Trash2 className="h-3.5 w-3.5" />
										</Button>
									</div>
								) : null}
							</li>
						))}
					</ul>
				)}
			</Panel>

			<Dialog
				open={classOpen}
				onOpenChange={(open: boolean) => {
					setClassOpen(open);
					if (!open) setEditingClass(null);
				}}
			>
				<DialogContent className="border-hairline bg-popover sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>
							{editingClass ? "Edit class" : "New class"}
						</DialogTitle>
						<DialogDescription>
							A class is a student group. Pick one of the rooms you manage
							below.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="space-y-1.5">
							<Label className="text-xs">Grade</Label>
							<Input
								value={classForm.grade}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
									setClassForm({ ...classForm, grade: event.target.value })
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs">Section</Label>
							<Input
								value={classForm.section}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
									setClassForm({ ...classForm, section: event.target.value })
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs">Room</Label>
							<Select
								value={classForm.roomNo || "none"}
								onValueChange={(value: string) =>
									setClassForm({
										...classForm,
										roomNo: value === "none" ? "" : value,
									})
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Choose a room" />
								</SelectTrigger>
								<SelectContent className="bg-popover">
									<SelectItem value="none">No room</SelectItem>
									{rooms.map((room) => (
										<SelectItem key={room.id} value={room.name}>
											{room.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs">Capacity</Label>
							<Input
								type="number"
								value={classForm.capacity}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
									setClassForm({
										...classForm,
										capacity: Number(event.target.value),
									})
								}
							/>
						</div>
						<div className="space-y-1.5 sm:col-span-2">
							<Label className="text-xs">Class teacher</Label>
							<Select
								value={classForm.classTeacherId || "none"}
								onValueChange={(value: string) =>
									setClassForm({
										...classForm,
										classTeacherId: value === "none" ? "" : value,
									})
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Choose a teacher" />
								</SelectTrigger>
								<SelectContent className="bg-popover">
									<SelectItem value="none">Unassigned</SelectItem>
									{staff.map((member) => (
										<SelectItem key={member.id} value={member.id}>
											{member.user.name} · {member.designation}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setClassOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={() =>
								editingClass ? updateClass.mutate() : createClass.mutate()
							}
							disabled={
								createClass.isPending ||
								updateClass.isPending ||
								!classForm.grade.trim() ||
								!classForm.section.trim()
							}
						>
							{editingClass
								? updateClass.isPending
									? "Saving…"
									: "Save changes"
								: createClass.isPending
									? "Creating…"
									: "Create class"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={roomOpen}
				onOpenChange={(open: boolean) => {
					setRoomOpen(open);
					if (!open) setEditingRoom(null);
				}}
			>
				<DialogContent className="border-hairline bg-popover sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{editingRoom ? "Edit room" : "Add room"}</DialogTitle>
						<DialogDescription>
							Rooms are separate from classes because several classes can use a
							lab or hall.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-3">
						<div className="space-y-1.5">
							<Label className="text-xs">Name</Label>
							<Input
								value={roomForm.name}
								placeholder="Room 106"
								onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
									setRoomForm({ ...roomForm, name: event.target.value })
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs">Building</Label>
							<Input
								value={roomForm.building}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
									setRoomForm({ ...roomForm, building: event.target.value })
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs">Capacity</Label>
							<Input
								type="number"
								value={roomForm.capacity}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
									setRoomForm({
										...roomForm,
										capacity: Number(event.target.value),
									})
								}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setRoomOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={() =>
								editingRoom ? updateRoom.mutate() : createRoom.mutate()
							}
							disabled={
								createRoom.isPending ||
								updateRoom.isPending ||
								!roomForm.name.trim()
							}
						>
							{editingRoom
								? updateRoom.isPending
									? "Saving…"
									: "Save changes"
								: createRoom.isPending
									? "Adding…"
									: "Add room"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
