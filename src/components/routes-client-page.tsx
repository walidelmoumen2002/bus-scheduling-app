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

// Define the type for a route based on your schema
type Route = {
    id: number;
    origin: string;
    destination: string;
    estimatedDurationMinutes: number;
};

export default function RoutesClientPage({ initialRoutes }: { initialRoutes: Route[] }) {
    const [routes, setRoutes] = useState<Route[]>(initialRoutes);
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const router = useRouter();

    const handleAddRoute = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch('/api/routes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ origin, destination, estimatedDurationMinutes }),
        });

        if (response.ok) {
            const newRoute = await response.json();
            setRoutes([...routes, newRoute]);
            setOrigin('');
            setDestination('');
            setEstimatedDurationMinutes('');
            setIsDialogOpen(false);
            router.refresh(); // Refresh the page to show the new route
        } else {
            alert('Failed to add route');
        }
    };

    const handleDeleteRoute = async (id: number) => {
        if (!confirm('Are you sure you want to delete this route?')) return;

        const response = await fetch('/api/routes', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });

        if (response.ok) {
            setRoutes(routes.filter(route => route.id !== id));
            router.refresh(); // Refresh the page
        } else {
            alert('Failed to delete route');
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Routes</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Add New Route</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Route</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddRoute} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="origin">Origin</Label>
                                <Input id="origin" value={origin} onChange={(e) => setOrigin(e.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="destination">Destination</Label>
                                <Input id="destination" value={destination} onChange={(e) => setDestination(e.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="estimatedDurationMinutes">Estimated Duration (minutes)</Label>
                                <Input id="estimatedDurationMinutes" type="number" value={estimatedDurationMinutes} onChange={(e) => setEstimatedDurationMinutes(e.target.value)} required />
                            </div>
                            <Button type="submit">Add Route</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Origin</TableHead>
                            <TableHead>Destination</TableHead>
                            <TableHead>Estimated Duration (minutes)</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {routes.map((route) => (
                            <TableRow key={route.id}>
                                <TableCell>{route.id}</TableCell>
                                <TableCell>{route.origin}</TableCell>
                                <TableCell>{route.destination}</TableCell>
                                <TableCell>{route.estimatedDurationMinutes}</TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm" className="mr-2" disabled>Edit</Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteRoute(route.id)}>Delete</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}