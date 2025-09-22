/* eslint-disable @typescript-eslint/no-unused-vars */
import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Checkbox, CheckboxWithLabel } from "~/components/ui/checkbox";
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupOption,
} from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Switch, SwitchWithLabel } from "~/components/ui/switch";
import { Slider, SliderWithLabel } from "~/components/ui/slider";
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "~/components/ui/form";
import { Calendar, CalendarWithInput } from "~/components/ui/calendar";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  DataTable,
} from "~/components/ui/table";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import {
  Pagination,
  PaginationWithInfo,
  SimplePagination,
  CompactPagination,
} from "~/components/ui/pagination";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
  CommandDialog,
  WeddingCommandPalette,
} from "~/components/ui/command";
import {
  Chart,
  RSVPChart,
  BudgetChart,
  TimelineChart,
} from "~/components/ui/chart";
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
  RSVPAlert,
  BudgetAlert,
  TimelineAlert,
} from "~/components/ui/alert";
import {
  ToastProvider,
  toast,
  toastSuccess,
  toastError,
  toastInfo,
  toastRSVPConfirmed,
  toastRSVPReminder,
  toastVendorBooked,
  toastBudgetAlert,
} from "~/components/ui/toast";
import {
  Progress,
  CircularProgress,
  IndeterminateProgress,
  ProgressWithSteps,
  UploadProgress,
  RSVPProgress,
} from "~/components/ui/progress";
import {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  SkeletonForm,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonGuestCard,
  SkeletonVendorCard,
  SkeletonPhotoGrid,
  SkeletonRSVPForm,
} from "~/components/ui/skeleton";

export default component$(() => {
  return (
    <ToastProvider>
      <>
        <div class="container mx-auto p-8 space-y-8">
        <h1 class="text-4xl font-bold text-center mb-8">UI Components Test</h1>

        {/* Hooks Integration Demo */}
        <section>
          <h2 class="text-2xl font-semibold mb-4">
            🎉 New Features: Hooks Integration
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Component Functionality</CardTitle>
              <CardDescription>
                All components now support Qwik signals and context for better
                performance
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="flex gap-2">
                <Badge variant="default">✅ Signals Integration</Badge>
                <Badge variant="secondary">✅ Context Providers</Badge>
                <Badge variant="outline">✅ Performance Optimized</Badge>
              </div>
              <div class="text-sm text-muted-foreground">
                <p>
                  • Components use Qwik signals for reactive state management
                </p>
                <p>
                  • Context providers enable shared state across component trees
                </p>
                <p>• Automatic code splitting and lazy loading by default</p>
                <p>• Resumable components for instant loading</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Performance Metrics */}
        <section>
          <h2 class="text-2xl font-semibold mb-4">📊 Performance Metrics</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle class="text-green-600">Bundle Size</CardTitle>
                <CardDescription>Total JavaScript bundle</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="text-3xl font-bold">177 KB</div>
                <p class="text-sm text-muted-foreground">0.17 MB total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle class="text-blue-600">Components</CardTitle>
                <CardDescription>UI Components migrated</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="text-3xl font-bold">44</div>
                <p class="text-sm text-muted-foreground">
                  4.03 KB per component
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle class="text-purple-600">Performance</CardTitle>
                <CardDescription>Qwik advantages</CardDescription>
              </CardHeader>
              <CardContent class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-green-500">✓</span>
                  <span class="text-sm">Resumable components</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-500">✓</span>
                  <span class="text-sm">Lazy loading</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-500">✓</span>
                  <span class="text-sm">Code splitting</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Button Examples */}
        <section>
          <h2 class="text-2xl font-semibold mb-4">Buttons</h2>
          <div class="flex gap-4 flex-wrap">
            <Button>Default Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </section>

        <Separator />

        {/* Card Example */}
        <section>
          <h2 class="text-2xl font-semibold mb-4">Cards</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Wedding Planning</CardTitle>
                <CardDescription>
                  Track your wedding planning progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  This is a sample card showcasing the migrated UI components.
                </p>
              </CardContent>
              <CardFooter>
                <Button>Learn More</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Form</CardTitle>
                <CardDescription>Get in touch with us</CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="space-y-2">
                  <Label for="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div class="space-y-2">
                  <Label for="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
              </CardContent>
              <CardFooter>
                <Button class="w-full">Send Message</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Tabs Example */}
        <section>
          <h2 class="text-2xl font-semibold mb-4">Tabs</h2>
          <Tabs defaultValue="overview" class="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                  <CardDescription>
                    General information about the wedding
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This tab contains overview information.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                  <CardDescription>
                    Detailed wedding information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This tab contains detailed information.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>Manage your preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This tab contains settings.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        <Separator />

        {/* Sheet Example */}
        <section>
          <h2 class="text-2xl font-semibold mb-4">Sheet (Drawer)</h2>
          <Sheet>
            <SheetTrigger>
              <Button>Open Sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Wedding Details</SheetTitle>
                <SheetDescription>
                  Here you can find information about our special day.
                </SheetDescription>
              </SheetHeader>
              <div class="py-4">
                <p>This is the content of the sheet component.</p>
                <p class="mt-2">
                  You can add any content here, like forms, information, or
                  navigation.
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </section>

        <Separator />

        {/* Accordion Example */}
        <section>
          <h2 class="text-2xl font-semibold mb-4">Accordion</h2>
          <Accordion type="single" collapsible class="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Wedding Ceremony</AccordionTrigger>
              <AccordionContent>
                The wedding ceremony will take place at 3:00 PM at the beautiful
                garden venue. We've planned a traditional ceremony with personal
                vows and live music.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Reception Details</AccordionTrigger>
              <AccordionContent>
                The reception will follow immediately after the ceremony. Dinner
                will be served at 6:00 PM with dancing to continue until
                midnight.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Dress Code</AccordionTrigger>
              <AccordionContent>
                We request cocktail attire for our guests. Please avoid wearing
                white, as that's reserved for the bride!
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <Separator />

        {/* Sidebar Example */}
        <section>
          <h2 class="text-2xl font-semibold mb-4">Sidebar</h2>
          <SidebarProvider>
            <div class="flex h-64 border rounded-lg overflow-hidden">
              <Sidebar>
                <SidebarHeader>
                  <h3 class="font-semibold p-2">Wedding Menu</h3>
                </SidebarHeader>
                <SidebarContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <span>Overview</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <span>Schedule</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <span>Venue</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <span>RSVP</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                  <SidebarTrigger />
                </SidebarFooter>
              </Sidebar>
              <main class="flex-1 p-4 bg-muted/20">
                <div class="space-y-2">
                  <SidebarTrigger />
                  <h3 class="text-lg font-semibold">Main Content Area</h3>
                  <p>
                    This is where the main content would be displayed. The
                    sidebar can be toggled using the trigger button.
                  </p>
                </div>
              </main>
            </div>
          </SidebarProvider>
        </section>

        <Separator />

        {/* Form Components */}
        <section>
          <h2 class="text-2xl font-semibold mb-4">Form Components</h2>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkbox Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Checkbox</CardTitle>
                <CardDescription>Boolean input components</CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <CheckboxWithLabel
                  label="I agree to the terms and conditions"
                  description="By checking this box, you agree to our terms of service"
                />
                <CheckboxWithLabel
                  label="Subscribe to newsletter"
                  description="Receive updates about our services"
                />
                <CheckboxWithLabel
                  label="Disabled option"
                  description="This option is currently unavailable"
                  disabled
                />
              </CardContent>
            </Card>

            {/* Radio Group Example */}
            <Card>
              <CardHeader>
                <CardTitle>Radio Group</CardTitle>
                <CardDescription>
                  Single selection from multiple options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup class="space-y-3">
                  <RadioGroupOption
                    value="wedding"
                    label="Wedding Ceremony"
                    description="3:00 PM at the garden venue"
                  />
                  <RadioGroupOption
                    value="reception"
                    label="Reception"
                    description="6:00 PM dinner and dancing"
                  />
                  <RadioGroupOption
                    value="afterparty"
                    label="After Party"
                    description="Late night celebration"
                  />
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Select Example */}
            <Card>
              <CardHeader>
                <CardTitle>Select</CardTitle>
                <CardDescription>Dropdown selection component</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-2">
                  <Label>Choose your meal preference</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a meal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chicken">Chicken Parmesan</SelectItem>
                      <SelectItem value="fish">Grilled Salmon</SelectItem>
                      <SelectItem value="vegetarian">
                        Vegetarian Pasta
                      </SelectItem>
                      <SelectItem value="vegan">Vegan Option</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Textarea Example */}
            <Card>
              <CardHeader>
                <CardTitle>Textarea</CardTitle>
                <CardDescription>
                  Multi-line text input with auto-resize
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-2">
                  <Label>Special requests or dietary restrictions</Label>
                  <Textarea
                    placeholder="Please let us know about any special dietary needs or requests..."
                    autoResize
                    minRows={3}
                    maxRows={6}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Switch Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Switch</CardTitle>
                <CardDescription>
                  Toggle component with smooth animations
                </CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <SwitchWithLabel
                  label="Email notifications"
                  description="Receive email updates about the wedding"
                />
                <SwitchWithLabel
                  label="SMS reminders"
                  description="Get SMS reminders for important dates"
                />
                <SwitchWithLabel
                  label="Disabled toggle"
                  description="This feature is not available"
                  disabled
                />
              </CardContent>
            </Card>

            {/* Slider Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Slider</CardTitle>
                <CardDescription>
                  Range input with touch support
                </CardDescription>
              </CardHeader>
              <CardContent class="space-y-6">
                <SliderWithLabel
                  label="Number of guests"
                  description="How many guests are you bringing?"
                  min={0}
                  max={10}
                  step={1}
                  showValue
                />
                <SliderWithLabel
                  label="Budget range"
                  description="What's your estimated budget?"
                  min={1000}
                  max={10000}
                  step={500}
                  showValue
                />
              </CardContent>
            </Card>
          </div>

          {/* Complete Form Example */}
          <Card class="mt-8">
            <CardHeader>
              <CardTitle>Complete Form Example</CardTitle>
              <CardDescription>
                A comprehensive form showcasing all components working together
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <FormLabel required>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" />
                    </FormControl>
                    <FormDescription>
                      This is the name that will appear on your invitation
                    </FormDescription>
                  </div>

                  <div class="space-y-2">
                    <FormLabel required>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" />
                    </FormControl>
                  </div>
                </div>

                <div class="space-y-2">
                  <FormLabel>Meal Preference</FormLabel>
                  <FormControl>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your meal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chicken">
                          Chicken Parmesan
                        </SelectItem>
                        <SelectItem value="fish">Grilled Salmon</SelectItem>
                        <SelectItem value="vegetarian">
                          Vegetarian Pasta
                        </SelectItem>
                        <SelectItem value="vegan">Vegan Option</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </div>

                <div class="space-y-2">
                  <FormLabel>Special Requests</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any dietary restrictions or special requests..."
                      autoResize
                    />
                  </FormControl>
                </div>

                <div class="space-y-4">
                  <FormLabel>RSVP Options</FormLabel>
                  <RadioGroup class="space-y-3">
                    <RadioGroupOption
                      value="attending"
                      label="Joyfully Accept"
                      description="I will be attending the wedding"
                    />
                    <RadioGroupOption
                      value="decline"
                      label="Regretfully Decline"
                      description="I will not be able to attend"
                    />
                    <RadioGroupOption
                      value="pending"
                      label="Maybe"
                      description="I'm not sure yet"
                    />
                  </RadioGroup>
                </div>

                <div class="space-y-4">
                  <FormLabel>Additional Options</FormLabel>
                  <div class="space-y-3">
                    <CheckboxWithLabel label="I would like to participate in group photos" />
                    <CheckboxWithLabel label="Send me wedding updates" />
                    <SwitchWithLabel
                      label="Subscribe to our newsletter"
                      description="Receive updates about future events"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <FormLabel>How many guests are you bringing?</FormLabel>
                  <FormControl>
                    <SliderWithLabel min={0} max={5} step={1} showValue />
                  </FormControl>
                </div>

                <Button type="submit" class="w-full">
                  Submit RSVP
                </Button>
              </Form>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Calendar Components */}
        <section>
          <h2 class="text-2xl font-semibold mb-4">Calendar Components</h2>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Calendar Example */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Calendar</CardTitle>
                <CardDescription>
                  Simple date picker with month navigation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  defaultMonth={new Date(2024, 5, 15)} // June 2024
                  disabled={(date) => {
                    // Disable past dates and weekends for this example
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return (
                      date < today || date.getDay() === 0 || date.getDay() === 6
                    );
                  }}
                />
              </CardContent>
            </Card>

            {/* Calendar with Input Example */}
            <Card>
              <CardHeader>
                <CardTitle>Calendar with Input</CardTitle>
                <CardDescription>
                  Date picker with input field integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <CalendarWithInput
                    placeholder="Select wedding date"
                    dateFormat="PPP"
                    disabled={(date) => {
                      // Disable dates before today and after 1 year from now
                      const today = new Date();
                      const oneYearFromNow = new Date();
                      oneYearFromNow.setFullYear(today.getFullYear() + 1);
                      return date < today || date > oneYearFromNow;
                    }}
                  />

                  <CalendarWithInput
                    placeholder="Select RSVP deadline"
                    dateFormat="PP"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Calendar in Form */}
            <Card>
              <CardHeader>
                <CardTitle>Calendar in Form</CardTitle>
                <CardDescription>
                  Calendar integrated with form validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form class="space-y-6">
                  <div class="space-y-2">
                    <FormLabel required>Wedding Date</FormLabel>
                    <FormControl>
                      <CalendarWithInput
                        placeholder="Choose your wedding date"
                        dateFormat="EEEE, MMMM do, yyyy"
                      />
                    </FormControl>
                    <FormDescription>
                      Select the date for your special day
                    </FormDescription>
                  </div>

                  <div class="space-y-2">
                    <FormLabel>Reception Time</FormLabel>
                    <FormControl>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reception time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6pm">6:00 PM</SelectItem>
                          <SelectItem value="7pm">7:00 PM</SelectItem>
                          <SelectItem value="8pm">8:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </div>

                  <Button type="submit">Save Wedding Details</Button>
                </Form>
              </CardContent>
            </Card>

            {/* Multiple Calendar Views */}
            <Card>
              <CardHeader>
                <CardTitle>Calendar Features</CardTitle>
                <CardDescription>
                  Demonstrating various calendar configurations
                </CardDescription>
              </CardHeader>
              <CardContent class="space-y-6">
                <div>
                  <h4 class="text-sm font-medium mb-2">Today Highlighted</h4>
                  <Calendar defaultMonth={new Date()} />
                </div>

                <div>
                  <h4 class="text-sm font-medium mb-2">Future Dates Only</h4>
                  <Calendar
                    defaultMonth={
                      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    } // 30 days from now
                    disabled={(date) => date < new Date()}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Table Components */}
        <section>
          <h2 class="text-2xl font-semibold mb-4">Table Components</h2>

          <div class="space-y-8">
            {/* Guest List Table */}
            <Card>
              <CardHeader>
                <CardTitle>Wedding Guest List</CardTitle>
                <CardDescription>
                  Manage your wedding guests with RSVP status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={[
                    {
                      name: "Sarah Johnson",
                      email: "sarah@example.com",
                      status: "Attending",
                      guests: 2,
                      table: "Table 1",
                    },
                    {
                      name: "Michael Chen",
                      email: "michael@example.com",
                      status: "Pending",
                      guests: 1,
                      table: "Table 2",
                    },
                    {
                      name: "Emma Davis",
                      email: "emma@example.com",
                      status: "Declined",
                      guests: 0,
                      table: "N/A",
                    },
                    {
                      name: "James Wilson",
                      email: "james@example.com",
                      status: "Attending",
                      guests: 3,
                      table: "Table 1",
                    },
                    {
                      name: "Lisa Brown",
                      email: "lisa@example.com",
                      status: "Attending",
                      guests: 1,
                      table: "Table 3",
                    },
                  ]}
                  columns={[
                    {
                      key: "name",
                      header: "Name",
                      sortable: true,
                    },
                    {
                      key: "email",
                      header: "Email",
                      sortable: true,
                    },
                    {
                      key: "status",
                      header: "RSVP Status",
                      sortable: true,
                      render: (status) => (
                        <span
                          class={cn(
                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                            {
                              "bg-green-100 text-green-800":
                                status === "Attending",
                              "bg-yellow-100 text-yellow-800":
                                status === "Pending",
                              "bg-red-100 text-red-800": status === "Declined",
                            }
                          )}
                        >
                          {String(status)}
                        </span>
                      ),
                    },
                    {
                      key: "guests",
                      header: "Additional Guests",
                      sortable: true,
                    },
                    {
                      key: "table",
                      header: "Assigned Table",
                      sortable: true,
                    },
                  ]}
                />
              </CardContent>
            </Card>

            {/* Vendor Information Table */}
            <Card>
              <CardHeader>
                <CardTitle>Vendor Information</CardTitle>
                <CardDescription>
                  Track your wedding vendors and payment status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={[
                    {
                      vendor: "Elegant Gardens",
                      service: "Venue",
                      contact: "John Smith",
                      phone: "(555) 123-4567",
                      status: "Confirmed",
                      amount: 2500,
                    },
                    {
                      vendor: "Bella Photography",
                      service: "Photography",
                      contact: "Maria Garcia",
                      phone: "(555) 234-5678",
                      status: "Deposit Paid",
                      amount: 1800,
                    },
                    {
                      vendor: "Sweet Creations",
                      service: "Cake",
                      contact: "David Lee",
                      phone: "(555) 345-6789",
                      status: "Pending",
                      amount: 600,
                    },
                    {
                      vendor: "Harmony Strings",
                      service: "Music",
                      contact: "Sarah Johnson",
                      phone: "(555) 456-7890",
                      status: "Confirmed",
                      amount: 1200,
                    },
                    {
                      vendor: "Floral Dreams",
                      service: "Flowers",
                      contact: "Mike Chen",
                      phone: "(555) 567-8901",
                      status: "Confirmed",
                      amount: 800,
                    },
                  ]}
                  columns={[
                    {
                      key: "vendor",
                      header: "Vendor",
                      sortable: true,
                    },
                    {
                      key: "service",
                      header: "Service",
                      sortable: true,
                    },
                    {
                      key: "contact",
                      header: "Contact Person",
                      sortable: true,
                    },
                    {
                      key: "phone",
                      header: "Phone",
                    },
                    {
                      key: "status",
                      header: "Status",
                      sortable: true,
                      render: (status) => (
                        <span
                          class={cn(
                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                            {
                              "bg-green-100 text-green-800":
                                status === "Confirmed",
                              "bg-blue-100 text-blue-800":
                                status === "Deposit Paid",
                              "bg-yellow-100 text-yellow-800":
                                status === "Pending",
                            }
                          )}
                        >
                          {String(status)}
                        </span>
                      ),
                    },
                    {
                      key: "amount",
                      header: "Amount",
                      sortable: true,
                      render: (amount) => `$${amount.toLocaleString()}`,
                    },
                  ]}
                />
              </CardContent>
            </Card>

            {/* Basic Table Example */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Table</CardTitle>
                <CardDescription>
                  Simple table with manual structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>Wedding Timeline</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead class="w-[100px]">Time</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead class="text-right">Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell class="font-medium">3:00 PM</TableCell>
                      <TableCell>Ceremony</TableCell>
                      <TableCell>Garden Pavilion</TableCell>
                      <TableCell class="text-right">30 min</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell class="font-medium">3:30 PM</TableCell>
                      <TableCell>Cocktail Hour</TableCell>
                      <TableCell>Garden Terrace</TableCell>
                      <TableCell class="text-right">60 min</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell class="font-medium">4:30 PM</TableCell>
                      <TableCell>Reception</TableCell>
                      <TableCell>Main Ballroom</TableCell>
                      <TableCell class="text-right">4 hours</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell class="font-medium">8:30 PM</TableCell>
                      <TableCell>Cake Cutting</TableCell>
                      <TableCell>Main Ballroom</TableCell>
                      <TableCell class="text-right">15 min</TableCell>
                    </TableRow>
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3}>Total Duration</TableCell>
                      <TableCell class="text-right">5 hours 45 min</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Carousel Components */}
        <section>
          <h2 class="text-2xl font-semibold mb-4">Carousel Components</h2>

          <div class="space-y-8">
            {/* Wedding Photo Gallery */}
            <Card>
              <CardHeader>
                <CardTitle>Wedding Photo Gallery</CardTitle>
                <CardDescription>
                  Browse through beautiful wedding moments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Carousel class="w-full max-w-2xl mx-auto">
                  <CarouselContent>
                    <CarouselItem>
                      <div class="relative aspect-video bg-gradient-to-br from-pink-100 to-rose-200 rounded-lg overflow-hidden">
                        <div class="absolute inset-0 flex items-center justify-center">
                          <div class="text-center">
                            <div class="text-6xl mb-4">💍</div>
                            <h3 class="text-xl font-semibold text-gray-800">
                              The Proposal
                            </h3>
                            <p class="text-gray-600">
                              A magical moment captured forever
                            </p>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div class="relative aspect-video bg-gradient-to-br from-purple-100 to-pink-200 rounded-lg overflow-hidden">
                        <div class="absolute inset-0 flex items-center justify-center">
                          <div class="text-center">
                            <div class="text-6xl mb-4">👰</div>
                            <h3 class="text-xl font-semibold text-gray-800">
                              Getting Ready
                            </h3>
                            <p class="text-gray-600">
                              Behind the scenes preparation
                            </p>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div class="relative aspect-video bg-gradient-to-br from-blue-100 to-cyan-200 rounded-lg overflow-hidden">
                        <div class="absolute inset-0 flex items-center justify-center">
                          <div class="text-center">
                            <div class="text-6xl mb-4">💒</div>
                            <h3 class="text-xl font-semibold text-gray-800">
                              Ceremony
                            </h3>
                            <p class="text-gray-600">
                              "I do" - the perfect moment
                            </p>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div class="relative aspect-video bg-gradient-to-br from-green-100 to-emerald-200 rounded-lg overflow-hidden">
                        <div class="absolute inset-0 flex items-center justify-center">
                          <div class="text-center">
                            <div class="text-6xl mb-4">🍾</div>
                            <h3 class="text-xl font-semibold text-gray-800">
                              Reception
                            </h3>
                            <p class="text-gray-600">
                              Celebrating with family and friends
                            </p>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div class="relative aspect-video bg-gradient-to-br from-yellow-100 to-orange-200 rounded-lg overflow-hidden">
                        <div class="absolute inset-0 flex items-center justify-center">
                          <div class="text-center">
                            <div class="text-6xl mb-4">💃</div>
                            <h3 class="text-xl font-semibold text-gray-800">
                              First Dance
                            </h3>
                            <p class="text-gray-600">Dancing into forever</p>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
                {/* CarouselDots removed */}
              </CardContent>
            </Card>

            {/* Auto-playing Carousel */}
            <Card>
              <CardHeader>
                <CardTitle>Auto-Playing Gallery</CardTitle>
                <CardDescription>
                  Slideshow with automatic transitions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <div class="bg-blue-100 p-8 rounded-lg">Slide 1</div>
                  <div class="bg-green-100 p-8 rounded-lg">Slide 2</div>
                  <div class="bg-yellow-100 p-8 rounded-lg">Slide 3</div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial Carousel */}
            <Card>
              <CardHeader>
                <CardTitle>Wedding Testimonials</CardTitle>
                <CardDescription>Hear from our happy couples</CardDescription>
              </CardHeader>
              <CardContent>
                <Carousel class="w-full max-w-2xl mx-auto">
                  <CarouselContent>
                    <CarouselItem>
                      <div class="p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg">
                        <div class="text-center">
                          <div class="text-4xl mb-4">💕</div>
                          <blockquote class="text-lg italic text-gray-700 mb-4">
                            "Our wedding day was absolutely perfect! The venue,
                            the food, and the service were all exceptional."
                          </blockquote>
                          <div class="flex items-center justify-center space-x-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} class="text-yellow-400">
                                ⭐
                              </span>
                            ))}
                          </div>
                          <cite class="text-sm font-semibold text-gray-600">
                            - Sarah & Michael
                          </cite>
                        </div>
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div class="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <div class="text-center">
                          <div class="text-4xl mb-4">🌟</div>
                          <blockquote class="text-lg italic text-gray-700 mb-4">
                            "The attention to detail was incredible. Every
                            moment felt special and memorable."
                          </blockquote>
                          <div class="flex items-center justify-center space-x-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} class="text-yellow-400">
                                ⭐
                              </span>
                            ))}
                          </div>
                          <cite class="text-sm font-semibold text-gray-600">
                            - Emma & James
                          </cite>
                        </div>
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div class="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                        <div class="text-center">
                          <div class="text-4xl mb-4">✨</div>
                          <blockquote class="text-lg italic text-gray-700 mb-4">
                            "From start to finish, everything was handled
                            professionally. We couldn't be happier!"
                          </blockquote>
                          <div class="flex items-center justify-center space-x-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} class="text-yellow-400">
                                ⭐
                              </span>
                            ))}
                          </div>
                          <cite class="text-sm font-semibold text-gray-600">
                            - Lisa & David
                          </cite>
                        </div>
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </CardContent>
            </Card>

            {/* Simple Image Carousel */}
            <Card>
              <CardHeader>
                <CardTitle>Simple Content Carousel</CardTitle>
                <CardDescription>
                  Basic carousel for any content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Carousel class="w-full max-w-lg mx-auto">
                  <CarouselContent>
                    <CarouselItem>
                      <div class="p-6 bg-muted rounded-lg text-center">
                        <h3 class="font-semibold mb-2">Ceremony Details</h3>
                        <p class="text-sm text-muted-foreground">
                          3:00 PM at the Garden Pavilion. Traditional ceremony
                          with personal vows.
                        </p>
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div class="p-6 bg-muted rounded-lg text-center">
                        <h3 class="font-semibold mb-2">Reception Info</h3>
                        <p class="text-sm text-muted-foreground">
                          6:00 PM reception with dinner and dancing until
                          midnight.
                        </p>
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div class="p-6 bg-muted rounded-lg text-center">
                        <h3 class="font-semibold mb-2">Dress Code</h3>
                        <p class="text-sm text-muted-foreground">
                          Cocktail attire requested. Please avoid wearing white.
                        </p>
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Pagination Components */}
        <section>
          <h2 class="text-2xl font-semibold mb-4">Pagination Components</h2>

          <div class="space-y-8">
            {/* Guest List Pagination */}
            <Card>
              <CardHeader>
                <CardTitle>Guest List Management</CardTitle>
                <CardDescription>
                  Navigate through wedding guest RSVPs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <div class="text-sm text-muted-foreground mb-4">
                    <p>Showing 25 guests per page from a total of 150 RSVPs</p>
                  </div>

                  {/* Mock guest list preview */}
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {[
                      { name: "Sarah Johnson", status: "Attending" },
                      { name: "Michael Chen", status: "Pending" },
                      { name: "Emma Davis", status: "Attending" },
                      { name: "James Wilson", status: "Attending" },
                      { name: "Lisa Brown", status: "Declined" },
                      { name: "David Lee", status: "Attending" },
                    ].map((guest, index) => (
                      <div key={index} class="p-3 border rounded-lg">
                        <div class="flex justify-between items-center">
                          <span class="font-medium">{guest.name}</span>
                          <span
                            class={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              {
                                "bg-green-100 text-green-800":
                                  guest.status === "Attending",
                                "bg-yellow-100 text-yellow-800":
                                  guest.status === "Pending",
                                "bg-red-100 text-red-800":
                                  guest.status === "Declined",
                              }
                            )}
                          >
                            {guest.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <PaginationWithInfo
                    currentPage={3}
                    totalPages={6}
                    totalItems={150}
                    itemsPerPage={25}
                    onPageChange$={(page) =>
                      console.log("Page changed to:", page)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Photo Gallery Pagination */}
            <Card>
              <CardHeader>
                <CardTitle>Wedding Photo Gallery</CardTitle>
                <CardDescription>Browse through wedding photos</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                      { emoji: "💍", title: "Engagement" },
                      { emoji: "👰", title: "Getting Ready" },
                      { emoji: "💒", title: "Ceremony" },
                      { emoji: "🍾", title: "Reception" },
                      { emoji: "💃", title: "First Dance" },
                      { emoji: "🎂", title: "Cake Cutting" },
                      { emoji: "🌟", title: "Speeches" },
                      { emoji: "🎉", title: "Party" },
                    ].map((photo, index) => (
                      <div
                        key={index}
                        class="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center"
                      >
                        <div class="text-center">
                          <div class="text-3xl mb-2">{photo.emoji}</div>
                          <div class="text-xs font-medium text-gray-600">
                            {photo.title}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Pagination
                    currentPage={2}
                    totalPages={8}
                    maxPageNumbers={7}
                    onPageChange$={(page) =>
                      console.log("Photo page changed to:", page)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vendor List Pagination */}
            <Card>
              <CardHeader>
                <CardTitle>Vendor Directory</CardTitle>
                <CardDescription>
                  Browse wedding vendors by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {[
                      {
                        name: "Elegant Gardens",
                        category: "Venues",
                        rating: 5,
                      },
                      {
                        name: "Bella Photography",
                        category: "Photography",
                        rating: 5,
                      },
                      { name: "Sweet Creations", category: "Cakes", rating: 4 },
                      { name: "Harmony Strings", category: "Music", rating: 5 },
                    ].map((vendor, index) => (
                      <div key={index} class="p-4 border rounded-lg">
                        <div class="flex justify-between items-start mb-2">
                          <div>
                            <h4 class="font-semibold">{vendor.name}</h4>
                            <p class="text-sm text-muted-foreground">
                              {vendor.category}
                            </p>
                          </div>
                          <div class="flex items-center space-x-1">
                            {[...Array(vendor.rating)].map((_, i) => (
                              <span key={i} class="text-yellow-400 text-sm">
                                ⭐
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Pagination
                    currentPage={1}
                    totalPages={12}
                    showFirstLast={true}
                    onPageChange$={(page) =>
                      console.log("Vendor page changed to:", page)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Different Pagination Styles */}
            <Card>
              <CardHeader>
                <CardTitle>Pagination Styles</CardTitle>
                <CardDescription>
                  Different pagination component variations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-6">
                  <div>
                    <h4 class="text-sm font-medium mb-3">Default Pagination</h4>
                    <Pagination
                      currentPage={3}
                      totalPages={10}
                      onPageChange$={(page) =>
                        console.log("Default pagination:", page)
                      }
                    />
                  </div>

                  <div>
                    <h4 class="text-sm font-medium mb-3">Simple Pagination</h4>
                    <SimplePagination
                      currentPage={2}
                      totalPages={5}
                      onPageChange$={(page) =>
                        console.log("Simple pagination:", page)
                      }
                    />
                  </div>

                  <div>
                    <h4 class="text-sm font-medium mb-3">Compact Pagination</h4>
                    <CompactPagination
                      currentPage={4}
                      totalPages={8}
                      onPageChange$={(page) =>
                        console.log("Compact pagination:", page)
                      }
                    />
                  </div>

                  <div>
                    <h4 class="text-sm font-medium mb-3">Small Size</h4>
                    <Pagination
                      currentPage={2}
                      totalPages={6}
                      size="sm"
                      onPageChange$={(page) =>
                        console.log("Small pagination:", page)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Command Components */}
        <section>
          <h2 class="text-2xl font-semibold mb-4">Command Components</h2>

          <div class="space-y-8">
            {/* Basic Command Example */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Command Palette</CardTitle>
                <CardDescription>Searchable command interface</CardDescription>
              </CardHeader>
              <CardContent>
                <Command class="rounded-lg border shadow-md">
                  <CommandInput placeholder="Type a command..." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                      <CommandItem>
                        <div class="flex items-center">
                          <span class="mr-2">📝</span>
                          Create new guest
                        </div>
                        <CommandShortcut>⌘N</CommandShortcut>
                      </CommandItem>
                      <CommandItem>
                        <div class="flex items-center">
                          <span class="mr-2">🔍</span>
                          Search guests
                        </div>
                        <CommandShortcut>⌘F</CommandShortcut>
                      </CommandItem>
                      <CommandItem>
                        <div class="flex items-center">
                          <span class="mr-2">📊</span>
                          View reports
                        </div>
                        <CommandShortcut>⌘R</CommandShortcut>
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Navigation">
                      <CommandItem>
                        <div class="flex items-center">
                          <span class="mr-2">🏠</span>
                          Go to dashboard
                        </div>
                      </CommandItem>
                      <CommandItem>
                        <div class="flex items-center">
                          <span class="mr-2">⚙️</span>
                          Settings
                        </div>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </CardContent>
            </Card>

            {/* Wedding Command Palette */}
            <Card>
              <CardHeader>
                <CardTitle>Wedding Command Palette</CardTitle>
                <CardDescription>
                  Search guests, vendors, and quick actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WeddingCommandPalette
                  guests={[
                    { name: "Sarah Johnson", status: "Attending", id: "1" },
                    { name: "Michael Chen", status: "Pending", id: "2" },
                    { name: "Emma Davis", status: "Attending", id: "3" },
                    { name: "James Wilson", status: "Declined", id: "4" },
                    { name: "Lisa Brown", status: "Attending", id: "5" },
                    { name: "David Lee", status: "Pending", id: "6" },
                    { name: "Maria Garcia", status: "Attending", id: "7" },
                    { name: "John Smith", status: "Attending", id: "8" },
                  ]}
                  vendors={[
                    { name: "Elegant Gardens", service: "Venue", id: "v1" },
                    {
                      name: "Bella Photography",
                      service: "Photography",
                      id: "v2",
                    },
                    { name: "Sweet Creations", service: "Cake", id: "v3" },
                    { name: "Harmony Strings", service: "Music", id: "v4" },
                    { name: "Floral Dreams", service: "Flowers", id: "v5" },
                  ]}
                  onGuestSelect$={(guest) =>
                    console.log("Selected guest:", guest)
                  }
                  onVendorSelect$={(vendor) =>
                    console.log("Selected vendor:", vendor)
                  }
                  onQuickAction$={(action) =>
                    console.log("Quick action:", action)
                  }
                />
              </CardContent>
            </Card>

            {/* Command Dialog Trigger */}
            <Card>
              <CardHeader>
                <CardTitle>Command Dialog</CardTitle>
                <CardDescription>
                  Modal command palette with keyboard shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <div class="flex items-center justify-center">
                    <Button
                      variant="outline"
                      onClick$={() => {
                        // In a real implementation, this would open the dialog
                        console.log("Opening command dialog...");
                      }}
                    >
                      <svg
                        class="mr-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      Search...{" "}
                      <kbd class="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span class="text-xs">⌘</span>K
                      </kbd>
                    </Button>
                  </div>

                  <div class="text-center text-sm text-muted-foreground">
                    <p>
                      Press{" "}
                      <kbd class="rounded border bg-muted px-1.5 font-mono text-xs">
                        ⌘K
                      </kbd>{" "}
                      to open command palette
                    </p>
                    <p class="mt-1">
                      Press{" "}
                      <kbd class="rounded border bg-muted px-1.5 font-mono text-xs">
                        Esc
                      </kbd>{" "}
                      to close
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Command Features */}
            <Card>
              <CardHeader>
                <CardTitle>Advanced Command Features</CardTitle>
                <CardDescription>
                  Grouped commands with shortcuts and icons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Command class="rounded-lg border shadow-md max-w-md mx-auto">
                  <CommandInput placeholder="Search wedding features..." />
                  <CommandList>
                    <CommandEmpty>No wedding features found.</CommandEmpty>

                    <CommandGroup heading="Guest Management">
                      <CommandItem>
                        <div class="flex items-center">
                          <span class="mr-2">👥</span>
                          <span>Add guest</span>
                        </div>
                        <CommandShortcut>⌘N</CommandShortcut>
                      </CommandItem>
                      <CommandItem>
                        <div class="flex items-center">
                          <span class="mr-2">📧</span>
                          <span>Send invitations</span>
                        </div>
                        <CommandShortcut>⌘I</CommandShortcut>
                      </CommandItem>
                      <CommandItem>
                        <div class="flex items-center">
                          <span class="mr-2">📊</span>
                          <span>View RSVPs</span>
                        </div>
                        <CommandShortcut>⌘R</CommandShortcut>
                      </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    <CommandGroup heading="Planning Tools">
                      <CommandItem>
                        <div class="flex items-center">
                          <span class="mr-2">📅</span>
                          <span>Schedule timeline</span>
                        </div>
                        <CommandShortcut>⌘T</CommandShortcut>
                      </CommandItem>
                      <CommandItem>
                        <div class="flex items-center">
                          <span class="mr-2">💰</span>
                          <span>Budget tracker</span>
                        </div>
                        <CommandShortcut>⌘B</CommandShortcut>
                      </CommandItem>
                      <CommandItem>
                        <div class="flex items-center">
                          <span class="mr-2">📋</span>
                          <span>Vendor checklist</span>
                        </div>
                        <CommandShortcut>⌘V</CommandShortcut>
                      </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    <CommandGroup heading="Communication">
                      <CommandItem>
                        <div class="flex items-center">
                          <span class="mr-2">💌</span>
                          <span>Send thank you notes</span>
                        </div>
                        <CommandShortcut>⌘Y</CommandShortcut>
                      </CommandItem>
                      <CommandItem>
                        <div class="flex items-center">
                          <span class="mr-2">📱</span>
                          <span>Update website</span>
                        </div>
                        <CommandShortcut>⌘U</CommandShortcut>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Chart Components */}
        <section>
          <h2 class="text-2xl font-semibold mb-4">Chart Components</h2>

          <div class="space-y-8">
            {/* Wedding-specific Charts */}
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* RSVP Status Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>RSVP Status</CardTitle>
                  <CardDescription>Guest response breakdown</CardDescription>
                </CardHeader>
                <CardContent class="flex justify-center">
                  <RSVPChart attending={85} pending={23} declined={12} />
                </CardContent>
              </Card>

              {/* Budget Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget Overview</CardTitle>
                  <CardDescription>Wedding budget tracking</CardDescription>
                </CardHeader>
                <CardContent class="flex justify-center">
                  <BudgetChart spent={8750} remaining={2250} />
                </CardContent>
              </Card>

              {/* Timeline Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>RSVP Timeline</CardTitle>
                  <CardDescription>Responses over time</CardDescription>
                </CardHeader>
                <CardContent class="flex justify-center">
                  <TimelineChart
                    data={[
                      { date: "2024-01-01", guests: 15 },
                      { date: "2024-01-08", guests: 32 },
                      { date: "2024-01-15", guests: 58 },
                      { date: "2024-01-22", guests: 78 },
                      { date: "2024-01-29", guests: 95 },
                      { date: "2024-02-05", guests: 105 },
                      { date: "2024-02-12", guests: 120 },
                    ]}
                  />
                </CardContent>
              </Card>
            </div>

            {/* General Chart Types */}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bar Chart - Vendor Ratings */}
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Ratings</CardTitle>
                  <CardDescription>
                    Average ratings by service type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart
                    data={[
                      { label: "Venue", value: 4.8, color: "#3B82F6" },
                      { label: "Photography", value: 4.9, color: "#10B981" },
                      { label: "Catering", value: 4.6, color: "#F59E0B" },
                      { label: "Music", value: 4.7, color: "#EF4444" },
                      { label: "Flowers", value: 4.5, color: "#8B5CF6" },
                    ]}
                    type="bar"
                    width={400}
                    height={300}
                    showLabels={true}
                    showValues={true}
                    title="Vendor Performance"
                  />
                </CardContent>
              </Card>

              {/* Pie Chart - Guest Demographics */}
              <Card>
                <CardHeader>
                  <CardTitle>Guest Demographics</CardTitle>
                  <CardDescription>
                    Guest distribution by relationship
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart
                    data={[
                      { label: "Family", value: 45, color: "#3B82F6" },
                      { label: "Friends", value: 35, color: "#10B981" },
                      { label: "Colleagues", value: 15, color: "#F59E0B" },
                      { label: "Other", value: 5, color: "#EF4444" },
                    ]}
                    type="pie"
                    width={350}
                    height={350}
                    showLabels={true}
                    showValues={true}
                    title="Guest Relationships"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Budget Breakdown Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Breakdown</CardTitle>
                <CardDescription>
                  Detailed wedding expense categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Chart
                  data={[
                    { label: "Venue", value: 2500, color: "#3B82F6" },
                    { label: "Photography", value: 1800, color: "#10B981" },
                    { label: "Catering", value: 3200, color: "#F59E0B" },
                    { label: "Music", value: 1200, color: "#EF4444" },
                    { label: "Flowers", value: 800, color: "#8B5CF6" },
                    { label: "Cake", value: 600, color: "#06B6D4" },
                    { label: "Attire", value: 1500, color: "#84CC16" },
                    { label: "Other", value: 650, color: "#F97316" },
                  ]}
                  type="bar"
                  width={600}
                  height={350}
                  showLabels={true}
                  showValues={true}
                  title="Wedding Budget Categories"
                />
              </CardContent>
            </Card>

            {/* RSVP Trend Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle>RSVP Response Trend</CardTitle>
                <CardDescription>Daily response rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <Chart
                  data={[
                    { label: "Jan 1", value: 5, color: "#3B82F6" },
                    { label: "Jan 8", value: 12, color: "#3B82F6" },
                    { label: "Jan 15", value: 8, color: "#3B82F6" },
                    { label: "Jan 22", value: 15, color: "#3B82F6" },
                    { label: "Jan 29", value: 18, color: "#3B82F6" },
                    { label: "Feb 5", value: 22, color: "#3B82F6" },
                    { label: "Feb 12", value: 25, color: "#3B82F6" },
                    { label: "Feb 19", value: 28, color: "#3B82F6" },
                    { label: "Feb 26", value: 32, color: "#3B82F6" },
                    { label: "Mar 5", value: 35, color: "#3B82F6" },
                  ]}
                  type="line"
                  width={600}
                  height={300}
                  showLabels={true}
                  showValues={false}
                  title="Daily RSVP Responses"
                />
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Alert Components */}
        <section>
          <h2 class="text-2xl font-semibold mb-4">Alert Components</h2>

          <div class="space-y-8">
            {/* Basic Alert Examples */}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Alert Variants</CardTitle>
                  <CardDescription>
                    Different alert styles and variants
                  </CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                  <Alert>
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <AlertTitle>Default Alert</AlertTitle>
                    <AlertDescription>
                      This is a default alert with an information icon.
                    </AlertDescription>
                  </Alert>

                  <Alert variant="destructive">
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <AlertTitle>Error Alert</AlertTitle>
                    <AlertDescription>
                      Something went wrong. Please try again later.
                    </AlertDescription>
                  </Alert>

                  <Alert variant="success">
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <AlertTitle>Success Alert</AlertTitle>
                    <AlertDescription>
                      Your changes have been saved successfully.
                    </AlertDescription>
                  </Alert>

                  <Alert variant="warning">
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <AlertTitle>Warning Alert</AlertTitle>
                    <AlertDescription>
                      Please review your information before proceeding.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alert with Actions</CardTitle>
                  <CardDescription>
                    Alerts with dismissible actions
                  </CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                  <Alert dismissible>
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 17h5l-5 5v-5z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <AlertTitle>Notification</AlertTitle>
                    <AlertDescription>
                      You have 3 new messages waiting for your response.
                    </AlertDescription>
                    <AlertAction>
                      <Button size="sm" variant="outline">
                        View Messages
                      </Button>
                      <Button size="sm">Mark as Read</Button>
                    </AlertAction>
                  </Alert>

                  <Alert variant="info">
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <AlertTitle>Update Available</AlertTitle>
                    <AlertDescription>
                      A new version of the wedding planner is available.
                    </AlertDescription>
                    <AlertAction>
                      <Button size="sm" variant="outline">
                        Learn More
                      </Button>
                      <Button size="sm">Update Now</Button>
                    </AlertAction>
                  </Alert>
                </CardContent>
              </Card>
            </div>

            {/* Wedding-Specific Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Wedding-Specific Alerts</CardTitle>
                <CardDescription>
                  Specialized alerts for wedding planning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <RSVPAlert
                    type="success"
                    guestName="Sarah Johnson"
                    action="confirmed"
                  />

                  <RSVPAlert
                    type="warning"
                    guestName="Michael Chen"
                    action="pending"
                  />

                  <RSVPAlert
                    type="error"
                    guestName="Emma Davis"
                    action="declined"
                  />

                  <BudgetAlert
                    type="warning"
                    category="Photography"
                    amount={2200}
                    budget={2000}
                  />

                  <BudgetAlert
                    type="error"
                    category="Venue"
                    amount={3200}
                    budget={2500}
                  />

                  <TimelineAlert
                    type="warning"
                    event="Final headcount due"
                    daysUntil={3}
                  />

                  <TimelineAlert
                    type="info"
                    event="Rehearsal dinner"
                    daysUntil={14}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Real-World Scenarios */}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>RSVP Management</CardTitle>
                  <CardDescription>Alerts for guest responses</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                  <Alert variant="success" dismissible>
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <AlertTitle>RSVP Confirmed</AlertTitle>
                    <AlertDescription>
                      John Smith has confirmed attendance for 2 guests. Total
                      confirmed: 45/120
                    </AlertDescription>
                  </Alert>

                  <Alert variant="warning">
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <AlertTitle>RSVP Deadline</AlertTitle>
                    <AlertDescription>
                      Only 7 days left until RSVP deadline. 23 guests still
                      pending.
                    </AlertDescription>
                    <AlertAction>
                      <Button size="sm" variant="outline">
                        Send Reminders
                      </Button>
                    </AlertAction>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget & Planning</CardTitle>
                  <CardDescription>
                    Financial and timeline alerts
                  </CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                  <Alert variant="destructive">
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                    <AlertTitle>Budget Alert</AlertTitle>
                    <AlertDescription>
                      Catering costs have exceeded budget by $450. Total spent:
                      $3,200 of $2,750 budget.
                    </AlertDescription>
                    <AlertAction>
                      <Button size="sm" variant="outline">
                        Review Budget
                      </Button>
                      <Button size="sm">Adjust Vendors</Button>
                    </AlertAction>
                  </Alert>

                  <Alert variant="info">
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0v10m0 0l-2-2m2 2l2-2m6-6h2a2 2 0 012 2v10a2 2 0 01-2 2h-2M9 7h6"
                      />
                    </svg>
                    <AlertTitle>Vendor Confirmation</AlertTitle>
                    <AlertDescription>
                      Bella Photography has confirmed your booking for June
                      15th. Contract sent to your email.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Separator />

        {/* Toast Components */}
        <section>
          <h2 class="text-2xl font-semibold mb-4">Toast Components</h2>

          <div class="space-y-8">
            {/* Basic Toast Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Toast Notifications</CardTitle>
                <CardDescription>
                  Different types of toast notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-3">
                    <Button
                      onClick$={() =>
                        toastSuccess(
                          "Success!",
                          "Your changes have been saved."
                        )
                      }
                      class="w-full"
                    >
                      Show Success Toast
                    </Button>

                    <Button
                      onClick$={() =>
                        toastError(
                          "Error!",
                          "Something went wrong. Please try again."
                        )
                      }
                      variant="destructive"
                      class="w-full"
                    >
                      Show Error Toast
                    </Button>

                    <Button
                      onClick$={() =>
                        toastInfo(
                          "Information",
                          "Here is some useful information."
                        )
                      }
                      variant="outline"
                      class="w-full"
                    >
                      Show Info Toast
                    </Button>
                  </div>

                  <div class="space-y-3">
                    <Button
                      onClick$={() =>
                        toast({
                          title: "Custom Toast",
                          description:
                            "This is a custom toast with an action button.",
                          action: {
                            label: "Undo",
                            onClick: () => console.log("Undo action"),
                          },
                        })
                      }
                      variant="secondary"
                      class="w-full"
                    >
                      Show Custom Toast
                    </Button>

                    <Button
                      onClick$={() =>
                        toast({
                          title: "Long Toast",
                          description:
                            "This toast stays visible for 10 seconds.",
                          duration: 10000,
                        })
                      }
                      variant="outline"
                      class="w-full"
                    >
                      Show Long Toast
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wedding-Specific Toasts */}
            <Card>
              <CardHeader>
                <CardTitle>Wedding Toast Notifications</CardTitle>
                <CardDescription>
                  Specialized toasts for wedding planning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button
                    onClick$={() => toastRSVPConfirmed("Sarah Johnson")}
                    class="w-full"
                    size="sm"
                  >
                    RSVP Confirmed
                  </Button>

                  <Button
                    onClick$={() => toastRSVPReminder(7)}
                    variant="outline"
                    class="w-full"
                    size="sm"
                  >
                    RSVP Reminder
                  </Button>

                  <Button
                    onClick$={() => toastVendorBooked("Bella Photography")}
                    variant="secondary"
                    class="w-full"
                    size="sm"
                  >
                    Vendor Booked
                  </Button>

                  <Button
                    onClick$={() => toastBudgetAlert("Catering", 3200)}
                    variant="destructive"
                    class="w-full"
                    size="sm"
                  >
                    Budget Alert
                  </Button>

                  <Button
                    onClick$={() =>
                      toastSuccess(
                        "Guest Added",
                        "Michael Chen has been added to your guest list."
                      )
                    }
                    class="w-full"
                    size="sm"
                  >
                    Guest Added
                  </Button>

                  <Button
                    onClick$={() =>
                      toastInfo(
                        "Timeline Update",
                        "Your wedding timeline has been updated."
                      )
                    }
                    variant="outline"
                    class="w-full"
                    size="sm"
                  >
                    Timeline Update
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Toast Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Interactive Toast Examples</CardTitle>
                <CardDescription>
                  Toasts with actions and user interactions
                </CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-3">
                    <h4 class="text-sm font-medium">RSVP Management</h4>
                    <Button
                      onClick$={() =>
                        toast({
                          title: "RSVP Deadline Approaching",
                          description:
                            "Only 3 days left for RSVPs. 15 guests still pending.",
                          action: {
                            label: "Send Reminders",
                            onClick: () => console.log("Sending reminders..."),
                          },
                          duration: 8000,
                        })
                      }
                      class="w-full"
                    >
                      RSVP Deadline Alert
                    </Button>

                    <Button
                      onClick$={() =>
                        toast({
                          title: "Bulk RSVP Update",
                          description:
                            "Successfully updated 8 RSVPs from the Johnson family.",
                          variant: "success",
                          action: {
                            label: "View Updates",
                            onClick: () => console.log("Viewing updates..."),
                          },
                        })
                      }
                      variant="outline"
                      class="w-full"
                    >
                      Bulk Update Success
                    </Button>
                  </div>

                  <div class="space-y-3">
                    <h4 class="text-sm font-medium">Vendor Management</h4>
                    <Button
                      onClick$={() =>
                        toast({
                          title: "Contract Signed",
                          description:
                            "Your contract with Elegant Gardens has been signed and filed.",
                          variant: "success",
                          action: {
                            label: "View Contract",
                            onClick: () => console.log("Viewing contract..."),
                          },
                        })
                      }
                      class="w-full"
                    >
                      Contract Signed
                    </Button>

                    <Button
                      onClick$={() =>
                        toast({
                          title: "Payment Reminder",
                          description:
                            "Final payment for Bella Photography is due in 5 days.",
                          variant: "destructive",
                          action: {
                            label: "Make Payment",
                            onClick: () => console.log("Processing payment..."),
                          },
                          duration: 10000,
                        })
                      }
                      variant="destructive"
                      class="w-full"
                    >
                      Payment Reminder
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Toast Behavior Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Toast Behavior Examples</CardTitle>
                <CardDescription>
                  Different toast durations and stacking
                </CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="space-y-2">
                    <h4 class="text-sm font-medium">Quick Toasts</h4>
                    <Button
                      onClick$={() => {
                        toastSuccess("Saved!", "Quick save confirmation.");
                        setTimeout(() => toastInfo("Auto-saved"), 500);
                      }}
                      size="sm"
                      class="w-full"
                    >
                      Show Multiple
                    </Button>
                  </div>

                  <div class="space-y-2">
                    <h4 class="text-sm font-medium">Persistent Toast</h4>
                    <Button
                      onClick$={() =>
                        toast({
                          title: "Important Notice",
                          description:
                            "This toast stays visible until dismissed.",
                          duration: 0, // Never auto-dismiss
                        })
                      }
                      variant="outline"
                      size="sm"
                      class="w-full"
                    >
                      Persistent Toast
                    </Button>
                  </div>

                  <div class="space-y-2">
                    <h4 class="text-sm font-medium">Progress Updates</h4>
                    <Button
                      onClick$={() => {
                        toastInfo(
                          "Uploading photos...",
                          "Starting upload process."
                        );
                        setTimeout(
                          () =>
                            toastSuccess(
                              "Upload Complete",
                              "All photos uploaded successfully!"
                            ),
                          2000
                        );
                      }}
                      variant="secondary"
                      size="sm"
                      class="w-full"
                    >
                      Progress Flow
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Progress Components */}
        <section>
          <h2 class="text-2xl font-semibold mb-4">Progress Components</h2>

          <div class="space-y-8">
            {/* Linear Progress Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Linear Progress Bars</CardTitle>
                <CardDescription>
                  Different progress bar styles and variants
                </CardDescription>
              </CardHeader>
              <CardContent class="space-y-6">
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span>Task Completion</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} showValue />
                </div>

                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span>Success Progress</span>
                    <span>90%</span>
                  </div>
                  <Progress value={90} variant="success" />
                </div>

                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span>Warning Progress</span>
                    <span>60%</span>
                  </div>
                  <Progress value={60} variant="warning" />
                </div>

                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span>Error Progress</span>
                    <span>25%</span>
                  </div>
                  <Progress value={25} variant="error" />
                </div>

                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span>Small Progress</span>
                    <span>50%</span>
                  </div>
                  <Progress value={50} size="sm" />
                </div>

                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span>Large Progress</span>
                    <span>80%</span>
                  </div>
                  <Progress value={80} size="lg" />
                </div>
              </CardContent>
            </Card>

            {/* Circular Progress Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Circular Progress Indicators</CardTitle>
                <CardDescription>
                  Circular progress with different sizes and styles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div class="flex flex-col items-center space-y-2">
                    <CircularProgress value={75} showValue />
                    <span class="text-xs text-muted-foreground">75%</span>
                  </div>

                  <div class="flex flex-col items-center space-y-2">
                    <CircularProgress
                      value={90}
                      variant="success"
                      size={80}
                      strokeWidth={6}
                    />
                    <span class="text-xs text-muted-foreground">Success</span>
                  </div>

                  <div class="flex flex-col items-center space-y-2">
                    <CircularProgress value={45} variant="warning" size={70} />
                    <span class="text-xs text-muted-foreground">Warning</span>
                  </div>

                  <div class="flex flex-col items-center space-y-2">
                    <CircularProgress
                      value={20}
                      variant="error"
                      size={60}
                      strokeWidth={3}
                    />
                    <span class="text-xs text-muted-foreground">Error</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Indeterminate Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Indeterminate Progress</CardTitle>
                <CardDescription>
                  Loading states for unknown duration
                </CardDescription>
              </CardHeader>
              <CardContent class="space-y-6">
                <div class="space-y-2">
                  <span class="text-sm font-medium">Default Size</span>
                  <IndeterminateProgress />
                </div>

                <div class="space-y-2">
                  <span class="text-sm font-medium">Small Size</span>
                  <IndeterminateProgress size="sm" />
                </div>

                <div class="space-y-2">
                  <span class="text-sm font-medium">Large Size</span>
                  <IndeterminateProgress size="lg" />
                </div>

                <div class="space-y-2">
                  <span class="text-sm font-medium">Success Variant</span>
                  <IndeterminateProgress variant="success" />
                </div>
              </CardContent>
            </Card>

            {/* Progress with Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Multi-Step Progress</CardTitle>
                <CardDescription>
                  Progress indicators for multi-step processes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-8">
                  <div>
                    <h4 class="text-sm font-medium mb-4">
                      Wedding Planning Steps
                    </h4>
                    <ProgressWithSteps
                      currentStep={3}
                      totalSteps={7}
                      steps={[
                        "Choose Date",
                        "Book Venue",
                        "Send Invites",
                        "Plan Menu",
                        "Hire Vendors",
                        "Finalize Details",
                        "Day Of",
                      ]}
                    />
                  </div>

                  <div>
                    <h4 class="text-sm font-medium mb-4">RSVP Process</h4>
                    <ProgressWithSteps
                      currentStep={2}
                      totalSteps={4}
                      steps={[
                        "Receive Invite",
                        "Submit Response",
                        "Choose Menu",
                        "Confirm Attendance",
                      ]}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wedding-Specific Progress */}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* RSVP Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>RSVP Progress Dashboard</CardTitle>
                  <CardDescription>
                    Track guest responses and attendance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RSVPProgress
                    confirmed={85}
                    pending={23}
                    declined={12}
                    total={120}
                  />
                </CardContent>
              </Card>

              {/* Upload Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>File Upload Progress</CardTitle>
                  <CardDescription>
                    Track photo and document uploads
                  </CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                  <UploadProgress
                    fileName="wedding-photos-001.jpg"
                    progress={75}
                  />

                  <UploadProgress fileName="guest-list.xlsx" progress={45} />

                  <UploadProgress fileName="venue-contract.pdf" progress={90} />
                </CardContent>
              </Card>
            </div>

            {/* Interactive Progress Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Interactive Progress Demo</CardTitle>
                <CardDescription>
                  Click buttons to see progress animations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div class="space-y-3">
                    <h4 class="text-sm font-medium">Linear Progress</h4>
                    <Button
                      onClick$={() => {
                        // Simulate progress animation
                        console.log("Simulating linear progress...");
                      }}
                      class="w-full"
                      size="sm"
                    >
                      Start Progress
                    </Button>
                    <Progress value={65} showValue />
                  </div>

                  <div class="space-y-3">
                    <h4 class="text-sm font-medium">Circular Progress</h4>
                    <Button
                      onClick$={() => {
                        // Simulate circular progress
                        console.log("Simulating circular progress...");
                      }}
                      variant="outline"
                      class="w-full"
                      size="sm"
                    >
                      Start Upload
                    </Button>
                    <div class="flex justify-center">
                      <CircularProgress value={78} showValue size={80} />
                    </div>
                  </div>

                  <div class="space-y-3">
                    <h4 class="text-sm font-medium">Step Progress</h4>
                    <Button
                      onClick$={() => {
                        // Simulate step progress
                        console.log("Advancing to next step...");
                      }}
                      variant="secondary"
                      class="w-full"
                      size="sm"
                    >
                      Next Step
                    </Button>
                    <ProgressWithSteps
                      currentStep={2}
                      totalSteps={5}
                      steps={[
                        "Start",
                        "Planning",
                        "Invites",
                        "Details",
                        "Complete",
                      ]}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Skeleton Components */}
        <section>
          <h2 class="text-2xl font-semibold mb-4">Skeleton Components</h2>

          <div class="space-y-8">
            {/* Basic Skeleton Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Skeleton Shapes</CardTitle>
                <CardDescription>
                  Different skeleton loading patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div class="space-y-2">
                    <span class="text-sm font-medium">Rectangle</span>
                    <Skeleton class="h-32 w-full" />
                  </div>

                  <div class="space-y-2">
                    <span class="text-sm font-medium">Circle</span>
                    <Skeleton class="h-32 w-32 rounded-full mx-auto" />
                  </div>

                  <div class="space-y-2">
                    <span class="text-sm font-medium">Square</span>
                    <Skeleton class="aspect-square w-full" />
                  </div>

                  <div class="space-y-2">
                    <span class="text-sm font-medium">Text Lines</span>
                    <SkeletonText lines={3} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avatar Skeletons */}
            <Card>
              <CardHeader>
                <CardTitle>Avatar Skeletons</CardTitle>
                <CardDescription>
                  Loading states for user avatars
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="flex items-center space-x-4">
                  <SkeletonAvatar size="sm" />
                  <SkeletonAvatar size="default" />
                  <SkeletonAvatar size="lg" />
                  <SkeletonAvatar size="default" shape="square" />
                </div>
              </CardContent>
            </Card>

            {/* Button Skeletons */}
            <Card>
              <CardHeader>
                <CardTitle>Button Skeletons</CardTitle>
                <CardDescription>Loading states for buttons</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="flex flex-wrap gap-4">
                  <SkeletonButton size="sm" />
                  <SkeletonButton size="default" />
                  <SkeletonButton size="lg" />
                  <SkeletonButton variant="outline" />
                </div>
              </CardContent>
            </Card>

            {/* Content Skeletons */}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Card Skeleton */}
              <Card>
                <CardHeader>
                  <CardTitle>Card Skeleton</CardTitle>
                  <CardDescription>
                    Loading state for content cards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SkeletonCard showAvatar showActions />
                </CardContent>
              </Card>

              {/* List Skeleton */}
              <Card>
                <CardHeader>
                  <CardTitle>List Skeleton</CardTitle>
                  <CardDescription>Loading state for lists</CardDescription>
                </CardHeader>
                <CardContent>
                  <SkeletonList items={4} showAvatar />
                </CardContent>
              </Card>
            </div>

            {/* Table Skeleton */}
            <Card>
              <CardHeader>
                <CardTitle>Table Skeleton</CardTitle>
                <CardDescription>Loading state for data tables</CardDescription>
              </CardHeader>
              <CardContent>
                <SkeletonTable rows={5} columns={4} showHeader />
              </CardContent>
            </Card>

            {/* Form Skeleton */}
            <Card>
              <CardHeader>
                <CardTitle>Form Skeleton</CardTitle>
                <CardDescription>Loading state for forms</CardDescription>
              </CardHeader>
              <CardContent>
                <SkeletonForm fields={4} showButtons />
              </CardContent>
            </Card>

            {/* Wedding-Specific Skeletons */}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Guest Cards Skeleton */}
              <Card>
                <CardHeader>
                  <CardTitle>Guest Cards Loading</CardTitle>
                  <CardDescription>
                    Loading state for guest list
                  </CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                  <SkeletonGuestCard />
                  <SkeletonGuestCard />
                  <SkeletonGuestCard />
                </CardContent>
              </Card>

              {/* Vendor Cards Skeleton */}
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Cards Loading</CardTitle>
                  <CardDescription>
                    Loading state for vendor directory
                  </CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                  <SkeletonVendorCard />
                  <SkeletonVendorCard />
                </CardContent>
              </Card>
            </div>

            {/* Photo Gallery Skeleton */}
            <Card>
              <CardHeader>
                <CardTitle>Photo Gallery Loading</CardTitle>
                <CardDescription>
                  Loading state for wedding photo galleries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SkeletonPhotoGrid count={6} />
              </CardContent>
            </Card>

            {/* RSVP Form Skeleton */}
            <Card>
              <CardHeader>
                <CardTitle>RSVP Form Loading</CardTitle>
                <CardDescription>Loading state for RSVP forms</CardDescription>
              </CardHeader>
              <CardContent>
                <SkeletonRSVPForm />
              </CardContent>
            </Card>

            {/* Real-World Examples */}
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Dashboard Loading */}
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Loading</CardTitle>
                  <CardDescription>Simulating dashboard load</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <Skeleton class="h-20 rounded-lg" />
                    <Skeleton class="h-20 rounded-lg" />
                  </div>
                  <SkeletonText lines={2} />
                  <Skeleton class="h-32 w-full" />
                </CardContent>
              </Card>

              {/* Profile Loading */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Loading</CardTitle>
                  <CardDescription>Simulating profile load</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                  <div class="flex items-center space-x-4">
                    <SkeletonAvatar size="lg" />
                    <div class="space-y-2">
                      <Skeleton class="h-5 w-32" />
                      <Skeleton class="h-4 w-24" />
                    </div>
                  </div>
                  <SkeletonText lines={3} />
                </CardContent>
              </Card>

              {/* Feed Loading */}
              <Card>
                <CardHeader>
                  <CardTitle>Feed Loading</CardTitle>
                  <CardDescription>Simulating social feed load</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} class="space-y-3">
                      <div class="flex items-center space-x-3">
                        <SkeletonAvatar size="sm" />
                        <div class="space-y-1">
                          <Skeleton class="h-4 w-24" />
                          <Skeleton class="h-3 w-16" />
                        </div>
                      </div>
                      <Skeleton class="h-24 w-full rounded-lg" />
                      <div class="flex space-x-2">
                        <Skeleton class="h-8 w-16" />
                        <Skeleton class="h-8 w-20" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        </div>
      </>
    </ToastProvider>
  );
});

export const head: DocumentHead = {
  title: "UI Components Test - Wedding Site",
  meta: [
    {
      name: "description",
      content: "Testing migrated UI components for the wedding website",
    },
  ],
};
