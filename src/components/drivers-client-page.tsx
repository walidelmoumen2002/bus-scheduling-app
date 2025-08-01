"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    DialogTrigger,
} from "@/components/ui/dialog";

// Define the type for a driver and user
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
    const [name, setName] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const router = useRouter();

    // Determine if the user has management permissions
    const canManage = user.role === 'admin' || user.role === 'dispatcher';

    const handleAddDriver = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch('/api/drivers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, licenseNumber }),
        });

        if (response.ok) {
            const newDriver = await response.json();
            setDrivers([...drivers, newDriver]);
            setName('');
            setLicenseNumber('');
            setIsDialogOpen(false);
            router.refresh(); // Refresh the page to show the new driver
        } else {
            alert('Failed to add driver');
        }
    };

    const handleDeleteDriver = async (id: number) => {
        if (!confirm('Are you sure you want to delete this driver?')) return;

        const response = await fetch('/api/drivers', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });

        if (response.ok) {
            setDrivers(drivers.filter(driver => driver.id !== id));
            router.refresh(); // Refresh the page
        } else {
            alert('Failed to delete driver');
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Drivers</h1>
                {canManage && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Add New Driver</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Driver</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddDriver} className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="licenseNumber">License Number</Label>
                                    <Input id="licenseNumber" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} required />
                                </div>
                                <Button type="submit">Add Driver</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="border rounded-lg shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>License Number</TableHead>
                            <TableHead>Available</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {drivers.map((driver) => (
                            <TableRow key={driver.id}>
                                <TableCell>{driver.id}</TableCell>
                                <TableCell>{driver.name}</TableCell>
                                <TableCell>{driver.licenseNumber}</TableCell>
                                <TableCell>{driver.available ? 'Yes' : 'No'}</TableCell>
                                <TableCell>
                                    {canManage && (
                                        <>
                                            <Button variant="outline" size="sm" className="mr-2" disabled>Edit</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteDriver(driver.id)}>Delete</Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}