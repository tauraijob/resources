<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">UI Showcase</h1>
      <p class="text-sm text-muted-foreground">Buttons, inputs, badges, tabs and more</p>
    </div>

    <section class="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Buttons</CardTitle></CardHeader>
        <CardContent class="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Inputs</CardTitle></CardHeader>
        <CardContent class="grid gap-3">
          <Input placeholder="Text input" />
          <Textarea rows="3" placeholder="Textarea" />
          <Select>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="one">One</SelectItem>
              <SelectItem value="two">Two</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Badges</CardTitle></CardHeader>
        <CardContent class="flex gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tabs</CardTitle></CardHeader>
        <CardContent>
          <Tabs default-value="account">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="account">Make changes to your account.</TabsContent>
            <TabsContent value="password">Change your password here.</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  </div>
</template>


