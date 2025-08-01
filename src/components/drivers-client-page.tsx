"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

// Define types for Driver and User
type Driver = {
    id: number;
    name: string;
    licenseNumber: string;
    available: boolean;
};

type User = {
    userId: number;
    role: string;
};

export default function DriversClientPage({ initialDrivers, user }: { initialDrivers: Driver[], user: User }) {
    const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentDriver, setCurrentDriver] = useState<Partial<Driver> | null>(null);
    const canManage = user.role === 'admin' || user.role === 'dispatcher';

    const handleAddNew = () => {
        setCurrentDriver({ name: '', licenseNumber: '', available: true });
        setIsDialogOpen(true);
    };

    const handleEdit = (driver: Driver) => {
        setCurrentDriver({ ...driver });
        setIsDialogOpen(true);
    };

    const handleSaveDriver = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentDriver) return;

        const isEditing = 'id' in currentDriver && currentDriver.id;
        const url = isEditing ? `/api/drivers/${currentDriver.id}` : '/api/drivers';
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentDriver),
        });

        if (response.ok) {
            const savedDriver = await response.json();
            if (isEditing) {
                setDrivers(drivers.map(d => d.id === savedDriver.id ? savedDriver : d));
            } else {
                setDrivers([...drivers, savedDriver]);
            }
            setIsDialogOpen(false);
            setCurrentDriver(null);
        } else {
            const data = await response.json();
            alert(`Failed to save driver: ${data.error || 'Unknown error'}`);
        }
    };

    const handleDeleteDriver = async (id: number) => {
        if (!confirm('Are you sure you want to delete this driver?')) return;

        const response = await fetch(`/api/drivers`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });

        if (response.ok) {
            setDrivers(drivers.filter(driver => driver.id !== id));
        } else {
            alert('Failed to delete driver');
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Drivers</h1>
                {canManage && <Button onClick={handleAddNew}>Add New Driver</Button>}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentDriver && currentDriver.id ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
                        <DialogDescription>
                            {currentDriver && currentDriver.id
                                ? "Make changes to the driver's details below."
                                : "Fill in the details to create a new driver."}
                        </DialogDescription>
                    </DialogHeader>
                    {currentDriver && (
                        <form onSubmit={handleSaveDriver} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={currentDriver.name || ''}
                                    onChange={(e) => setCurrentDriver({ ...currentDriver, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="licenseNumber">License Number</Label>
                                <Input
                                    id="licenseNumber"
                                    value={currentDriver.licenseNumber || ''}
                                    onChange={(e) => setCurrentDriver({ ...currentDriver, licenseNumber: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="available"
                                    checked={currentDriver.available}
                                    onCheckedChange={(checked) => setCurrentDriver({ ...currentDriver, available: checked })}
                                />
                                <Label htmlFor="available">Available for shifts</Label>
                            </div>
                            <Button type="submit">Save Changes</Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <div className="border rounded-lg shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>License Number</TableHead>
                            <TableHead>Available</TableHead>
                            {canManage && <TableHead>Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {drivers.map((driver) => (
                            <TableRow key={driver.id}>
                                <TableCell>{driver.id}</TableCell>
                                <TableCell>{driver.name}</TableCell>
                                <TableCell>{driver.licenseNumber}</TableCell>
                                <TableCell>{driver.available ? 'Yes' : 'No'}</TableCell>
                                {canManage && (
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(driver)}>Edit</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteDriver(driver.id)}>Delete</Button>
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}