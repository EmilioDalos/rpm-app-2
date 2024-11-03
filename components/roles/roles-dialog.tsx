"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Role, RoleFormData } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Plus, Trash2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["personal", "professional"]),
  description: z.string().min(1, "Description is required"),
  subroles: z.array(
    z.object({
      name: z.string().min(1, "Sub-role name is required"),
    })
  ),
});

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (role: Role) => void;
  role?: Role;
}

export function RoleDialog({
  open,
  onOpenChange,
  onSave,
  role,
}: RoleDialogProps) {
  const form = useForm<RoleFormData & { subroles: { name: string }[] }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: role?.name || "",
      description: role?.description || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subroles",
  });

  const onSubmit = (data: RoleFormData & { subroles: { name: string }[] }) => {
    const subroles = data.subroles.map((subrole) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: subrole.name,
    }));

    const newRole: Role = {
      id: role?.id || Math.random().toString(36).substr(2, 9),
      name: data.name,
      description: data.description,
      createdAt: role?.createdAt || new Date(),
      updatedAt: new Date(),
      categoryId: role?.categoryId || "",
      purpose: role?.purpose || "",
      coreQualities: role?.coreQualities || [],
      identityStatement: role?.identityStatement || "",
      reflection: "",
      imageBlob: data?.imageBlob || "",
    };

    onSave(newRole);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Create New Role"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Role name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe this role..." {...field} value={field.value as string} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>Sub-roles</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: "" })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sub-role
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`subroles.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Sub-role name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
