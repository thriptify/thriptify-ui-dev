import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import {
  Text,
  Button,
  Card,
  Badge,
  Input,
  Icon,
  Checkbox,
  Radio,
  Switch,
  Spinner,
  Progress,
  Divider,
  Avatar,
  Slider,
  TextArea,
  Select,
  Link,
  Skeleton,
  Toast,
  Image,
  Spacer,
  Tabs,
  TabPanel,
  Breadcrumb,
  Modal,
  ModalBody,
  ModalFooter,
  Drawer,
  DrawerBody,
  DrawerFooter,
  Menu,
  Tooltip,
} from '@thriptify/ui-elements';
import { tokens } from '@thriptify/tokens/react-native';
import { useState } from 'react';

export default function UIElementsScreen() {
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [radioSelected, setRadioSelected] = useState<string | null>(null);
  const [switchValue, setSwitchValue] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const [sliderValue2, setSliderValue2] = useState(25);
  const [sliderValue3, setSliderValue3] = useState(75);
  const [textareaValue, setTextareaValue] = useState('');
  const [selectValue, setSelectValue] = useState<string | number | undefined>();
  const [toastVisible, setToastVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('tab1');
  const [showModal, setShowModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const tabItems = [
    { id: 'tab1', label: 'Tab 1' },
    { id: 'tab2', label: 'Tab 2' },
    { id: 'tab3', label: 'Tab 3' },
  ];

  const breadcrumbItems = [
    { label: 'Home', onPress: () => {} },
    { label: 'Products', onPress: () => {} },
    { label: 'Current' },
  ];

  const menuItems = [
    { id: '1', label: 'Edit', onPress: () => {} },
    { id: '2', label: 'Duplicate', onPress: () => {} },
    { type: 'divider' as const },
    { id: '3', label: 'Delete', destructive: true, onPress: () => {} },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="h1" style={styles.title}>UI Elements Showcase</Text>
      <Text variant="body" style={styles.subtitle}>
        Primitive building blocks from @thriptify/ui-elements
      </Text>

      {/* Text Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Text Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Typography component with semantic variants
        </Text>
        
        <View style={styles.textExamples}>
          <Text variant="h1">Heading 1 (h1)</Text>
          <Text variant="h2">Heading 2 (h2)</Text>
          <Text variant="h3">Heading 3 (h3)</Text>
          <Text variant="h4">Heading 4 (h4)</Text>
          <Text variant="body">Body text - default paragraph style</Text>
          <Text variant="bodySmall">Body Small - smaller body text</Text>
          <Text variant="caption">Caption - for small labels and hints</Text>
          <Text variant="label">Label - for form labels</Text>
        </View>

        <View style={styles.textExamples}>
          <Text variant="body" weight="light">Light weight text</Text>
          <Text variant="body" weight="normal">Normal weight text</Text>
          <Text variant="body" weight="medium">Medium weight text</Text>
          <Text variant="body" weight="semibold">Semibold weight text</Text>
          <Text variant="body" weight="bold">Bold weight text</Text>
        </View>
      </View>

      {/* Button Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Button Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Interactive button with variants and sizes
        </Text>
        
        <View style={styles.buttonExamples}>
          <Button variant="primary" size="sm" onPress={() => {}}>
            Primary Small
          </Button>
          <Button variant="primary" size="md" onPress={() => {}}>
            Primary Medium
          </Button>
          <Button variant="primary" size="lg" onPress={() => {}}>
            Primary Large
          </Button>
          <Button variant="secondary" onPress={() => {}}>
            Secondary
          </Button>
          <Button variant="outline" onPress={() => {}}>
            Outline
          </Button>
          <Button variant="ghost" onPress={() => {}}>
            Ghost
          </Button>
          <Button variant="primary" loading onPress={() => {}}>
            Loading
          </Button>
          <Button variant="primary" disabled onPress={() => {}}>
            Disabled
          </Button>
        </View>
      </View>

      {/* Card Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Card Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Container component with variants
        </Text>
        
        <View style={styles.cardExamples}>
          <Card variant="default" padding="sm">
            <Text variant="body">Default card with small padding</Text>
          </Card>
          <Card variant="elevated" padding="md">
            <Text variant="body">Elevated card with medium padding</Text>
          </Card>
          <Card variant="outlined" padding="lg">
            <Text variant="body">Outlined card with large padding</Text>
          </Card>
        </View>
      </View>

      {/* Badge Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Badge Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Small status indicators and labels
        </Text>
        
        <View style={styles.badgeExamples}>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="primary" size="sm">Small</Badge>
          <Badge variant="primary" size="md">Medium</Badge>
        </View>
      </View>

      {/* Input Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Input Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Form input with labels and error states
        </Text>
        
        <View style={styles.inputExamples}>
          <Input
            label="Default Input"
            placeholder="Enter text here"
            size="md"
          />
          <Input
            label="Small Input"
            placeholder="Small size"
            size="sm"
          />
          <Input
            label="Large Input"
            placeholder="Large size"
            size="lg"
          />
          <Input
            label="Input with Helper Text"
            placeholder="With helper text"
            helperText="This is helpful information"
          />
          <Input
            label="Error Input"
            placeholder="This has an error"
            variant="error"
            error="This field is required"
          />
        </View>
      </View>

      {/* Icon Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Icon Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Cross-platform icon component (SF Symbols on iOS, Material Icons on Android/Web)
        </Text>
        
        <View style={styles.iconExamples}>
          <View style={styles.iconRow}>
            <Icon name="home" size="md" />
            <Icon name="heart-fill" size="md" />
            <Icon name="cart" size="md" />
            <Icon name="user" size="md" />
            <Icon name="settings" size="md" />
          </View>
          <View style={styles.iconRow}>
            <Icon name="search" size="sm" />
            <Icon name="chevron-right" size="sm" />
            <Icon name="check" size="sm" />
            <Icon name="x" size="sm" />
            <Icon name="plus" size="sm" />
          </View>
          <View style={styles.iconRow}>
            <Icon name="star-fill" size="lg" />
            <Icon name="bell-fill" size="lg" />
            <Icon name="bookmark-fill" size="lg" />
          </View>
        </View>
      </View>

      {/* Checkbox Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Checkbox Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Selection input with checked/unchecked states
        </Text>
        
        <View style={styles.checkboxExamples}>
          <Checkbox
            checked={checkboxChecked}
            onChange={setCheckboxChecked}
            label="Accept terms and conditions"
            size="md"
          />
          <Checkbox
            checked={true}
            onChange={() => {}}
            label="Checked by default"
            size="sm"
          />
          <Checkbox
            checked={false}
            onChange={() => {}}
            label="Unchecked"
            size="lg"
          />
          <Checkbox
            checked={false}
            onChange={() => {}}
            label="Disabled checkbox"
            disabled
          />
        </View>
      </View>

      {/* Radio Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Radio Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Single selection from a group
        </Text>
        
        <View style={styles.radioExamples}>
          <Radio
            selected={radioSelected === 'option1'}
            onSelect={() => setRadioSelected('option1')}
            label="Option 1"
            size="md"
          />
          <Radio
            selected={radioSelected === 'option2'}
            onSelect={() => setRadioSelected('option2')}
            label="Option 2"
            size="md"
          />
          <Radio
            selected={radioSelected === 'option3'}
            onSelect={() => setRadioSelected('option3')}
            label="Option 3"
            size="md"
          />
          <Radio
            selected={false}
            onSelect={() => {}}
            label="Disabled radio"
            disabled
          />
        </View>
      </View>

      {/* Switch Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Switch Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Toggle switch for on/off states
        </Text>
        
        <View style={styles.switchExamples}>
          <Switch
            value={switchValue}
            onValueChange={setSwitchValue}
            label="Enable notifications"
            size="md"
          />
          <Switch
            value={true}
            onValueChange={() => {}}
            label="Switch ON"
            size="sm"
          />
          <Switch
            value={false}
            onValueChange={() => {}}
            label="Switch OFF"
            size="lg"
          />
          <Switch
            value={false}
            onValueChange={() => {}}
            label="Disabled switch"
            disabled
          />
        </View>
      </View>

      {/* Spinner Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Spinner Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Loading indicator with size variants
        </Text>
        
        <View style={styles.spinnerExamples}>
          <View style={styles.spinnerRow}>
            <Spinner size="sm" />
            <Text variant="caption">Small</Text>
          </View>
          <View style={styles.spinnerRow}>
            <Spinner size="md" />
            <Text variant="caption">Medium</Text>
          </View>
          <View style={styles.spinnerRow}>
            <Spinner size="lg" />
            <Text variant="caption">Large</Text>
          </View>
          <View style={styles.spinnerRow}>
            <Spinner size="md" section="groceries" />
            <Text variant="caption">Groceries Theme</Text>
          </View>
          <View style={styles.spinnerRow}>
            <Spinner size="md" section="recipes" />
            <Text variant="caption">Recipes Theme</Text>
          </View>
        </View>
      </View>

      {/* Progress Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Progress Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Linear progress bar with percentage display
        </Text>
        
        <View style={styles.progressExamples}>
          <Progress value={25} size="sm" showLabel />
          <Progress value={50} size="md" showLabel />
          <Progress value={75} size="lg" showLabel />
          <Progress value={100} size="md" showLabel />
          <Progress indeterminate size="md" />
        </View>
      </View>

      {/* Divider Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Divider Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Visual separator with horizontal and vertical orientations
        </Text>
        
        <View style={styles.dividerExamples}>
          <Text variant="body">Above divider</Text>
          <Divider spacing="md" variant="solid" />
          <Text variant="body">Below divider</Text>
          <Divider spacing="sm" variant="dashed" />
          <Text variant="body">Another divider</Text>
        </View>
      </View>

      {/* Avatar Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Avatar Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          User profile image with fallback text/initials
        </Text>
        
        <View style={styles.avatarExamples}>
          <View style={styles.avatarRow}>
            <Avatar size="sm" fallback="JD" />
            <Avatar size="md" fallback="AB" />
            <Avatar size="lg" fallback="CD" />
            <Avatar size="xl" fallback="EF" />
          </View>
          <View style={styles.avatarRow}>
            <Avatar size="md" fallback="John Doe" section="groceries" />
            <Avatar size="md" fallback="Jane Smith" section="recipes" />
            <Avatar size="md" fallback="User" />
          </View>
        </View>
      </View>

      {/* Slider Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Slider Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Interactive slider for selecting values within a range
        </Text>
        
        <View style={styles.sliderExamples}>
          <Slider
            value={sliderValue}
            minimumValue={0}
            maximumValue={100}
            onValueChange={setSliderValue}
            label="Volume"
            showValue
            size="md"
          />
          <Slider
            value={sliderValue2}
            minimumValue={0}
            maximumValue={100}
            onValueChange={setSliderValue2}
            label="Brightness"
            showValue
            size="sm"
          />
          <Slider
            value={sliderValue3}
            minimumValue={0}
            maximumValue={100}
            onValueChange={setSliderValue3}
            label="Opacity"
            showValue
            size="lg"
          />
          <Slider
            value={50}
            minimumValue={0}
            maximumValue={100}
            step={10}
            label="Step Slider (10)"
            showValue
            size="md"
          />
          <Slider
            value={30}
            minimumValue={0}
            maximumValue={100}
            label="Groceries Theme"
            showValue
            size="md"
            section="groceries"
          />
          <Slider
            value={60}
            minimumValue={0}
            maximumValue={100}
            label="Recipes Theme"
            showValue
            size="md"
            section="recipes"
          />
          <Slider
            value={40}
            minimumValue={0}
            maximumValue={100}
            label="Disabled Slider"
            showValue
            size="md"
            disabled
          />
        </View>
      </View>

      {/* TextArea Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>TextArea Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Multi-line text input field
        </Text>
        
        <View style={styles.textAreaExamples}>
          <TextArea
            label="Description"
            placeholder="Enter description here..."
            value={textareaValue}
            onChangeText={setTextareaValue}
            rows={4}
            size="md"
          />
          <TextArea
            label="Small TextArea"
            placeholder="Small size"
            rows={3}
            size="sm"
          />
          <TextArea
            label="Large TextArea"
            placeholder="Large size"
            rows={6}
            size="lg"
          />
          <TextArea
            label="TextArea with Error"
            placeholder="This has an error"
            error="This field is required"
            variant="error"
          />
        </View>
      </View>

      {/* Select Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Select/Dropdown Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Selection from a list of options
        </Text>
        
        <View style={styles.selectExamples}>
          <Select
            label="Choose an option"
            value={selectValue}
            onChange={setSelectValue}
            options={[
              { label: 'Option 1', value: 'option1' },
              { label: 'Option 2', value: 'option2' },
              { label: 'Option 3', value: 'option3' },
            ]}
            placeholder="Select an option"
            size="md"
          />
          <Select
            label="Small Select"
            value={selectValue}
            onChange={setSelectValue}
            options={[
              { label: 'Small 1', value: 's1' },
              { label: 'Small 2', value: 's2' },
            ]}
            size="sm"
          />
          <Select
            label="Select with Error"
            value={undefined}
            onChange={setSelectValue}
            options={[
              { label: 'Option A', value: 'a' },
              { label: 'Option B', value: 'b' },
            ]}
            error="Please select an option"
          />
        </View>
      </View>

      {/* Link Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Link Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Navigation link with pressable behavior
        </Text>
        
        <View style={styles.linkExamples}>
          <Link variant="default" onPress={() => console.log('Link pressed')}>
            Default Link
          </Link>
          <Link variant="primary" onPress={() => console.log('Primary link')}>
            Primary Link
          </Link>
          <Link variant="secondary" onPress={() => console.log('Secondary link')}>
            Secondary Link
          </Link>
          <Link variant="subtle" onPress={() => console.log('Subtle link')}>
            Subtle Link
          </Link>
          <Link href="https://example.com" openInNewTab>
            External Link
          </Link>
        </View>
      </View>

      {/* Skeleton Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Skeleton Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Loading placeholder with shimmer animation
        </Text>
        
        <View style={styles.skeletonExamples}>
          <View style={styles.skeletonRow}>
            <Skeleton variant="text" size="sm" width={100} />
            <Text variant="caption">Text Skeleton (sm)</Text>
          </View>
          <View style={styles.skeletonRow}>
            <Skeleton variant="text" size="md" width={150} />
            <Text variant="caption">Text Skeleton (md)</Text>
          </View>
          <View style={styles.skeletonRow}>
            <Skeleton variant="circular" size="md" />
            <Text variant="caption">Circular Skeleton</Text>
          </View>
          <View style={styles.skeletonRow}>
            <Skeleton variant="rectangular" width={200} height={100} />
            <Text variant="caption">Rectangular Skeleton</Text>
          </View>
        </View>
      </View>

      {/* Spacer Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Spacer Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Flexible spacing component for layout
        </Text>

        <View style={styles.spacerExamples}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text variant="body">Before</Text>
            <Spacer size={4} />
            <Text variant="body">After 4px</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text variant="body">Before</Text>
            <Spacer size={8} />
            <Text variant="body">After 8px</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text variant="body">Before</Text>
            <Spacer width={32} height={16} />
            <Text variant="body">After custom</Text>
          </View>
        </View>
      </View>

      {/* Toast Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Toast Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Temporary notification messages
        </Text>

        <View style={styles.toastExamples}>
          <Button onPress={() => setToastVisible(true)}>Show Toast</Button>
          {toastVisible && (
            <Toast
              variant="success"
              title="Success!"
              message="This is a toast notification."
              showCloseButton
              onDismiss={() => setToastVisible(false)}
              position="bottom"
            />
          )}
        </View>
      </View>

      {/* Image Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Image Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Cross-platform image component with loading states
        </Text>

        <View style={styles.imageExamples}>
          <Image
            source={{ uri: 'https://picsum.photos/200/100' }}
            width={200}
            height={100}
            borderRadius={8}
          />
          <Image
            source={{ uri: 'https://picsum.photos/80/80' }}
            width={80}
            height={80}
            circular
          />
        </View>
      </View>

      {/* Tabs Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Tabs Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Tab navigation with content panels
        </Text>

        <View style={styles.tabsExamples}>
          <Tabs
            items={tabItems}
            selectedId={selectedTab}
            onSelect={setSelectedTab}
          />
          <Card variant="outlined">
            <TabPanel isActive={selectedTab === 'tab1'}>
              <Text>Content for Tab 1</Text>
            </TabPanel>
            <TabPanel isActive={selectedTab === 'tab2'}>
              <Text>Content for Tab 2</Text>
            </TabPanel>
            <TabPanel isActive={selectedTab === 'tab3'}>
              <Text>Content for Tab 3</Text>
            </TabPanel>
          </Card>
          <Spacer size={4} />
          <Text variant="caption" colorScheme="muted">Pills variant:</Text>
          <Tabs items={tabItems} selectedId={selectedTab} onSelect={setSelectedTab} variant="pills" />
        </View>
      </View>

      {/* Breadcrumb Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Breadcrumb Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Navigation breadcrumb trail
        </Text>

        <View style={styles.breadcrumbExamples}>
          <Breadcrumb items={breadcrumbItems} />
          <Breadcrumb items={breadcrumbItems} separator=">" />
          <Breadcrumb items={breadcrumbItems} size="sm" />
          <Breadcrumb items={breadcrumbItems} colorScheme="primary" />
        </View>
      </View>

      {/* Modal Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Modal Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Dialog overlay with backdrop
        </Text>

        <View style={styles.modalExamples}>
          <Button onPress={() => setShowModal(true)}>Open Modal</Button>
          <Modal
            visible={showModal}
            onClose={() => setShowModal(false)}
            title="Example Modal"
            size="md"
          >
            <ModalBody>
              <Text>This is modal content. It supports scrolling, keyboard avoidance, and backdrop click to close.</Text>
              <Spacer size={4} />
              <Text variant="bodySmall" colorScheme="muted">Press ESC or click outside to close.</Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onPress={() => setShowModal(false)}>Cancel</Button>
              <Button onPress={() => setShowModal(false)}>Confirm</Button>
            </ModalFooter>
          </Modal>
        </View>
      </View>

      {/* Drawer Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Drawer Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Slide-out panel from any edge
        </Text>

        <View style={styles.drawerExamples}>
          <Button onPress={() => setShowDrawer(true)}>Open Drawer</Button>
          <Drawer
            visible={showDrawer}
            onClose={() => setShowDrawer(false)}
            position="left"
            size="md"
            title="Menu"
          >
            <DrawerBody>
              <View style={{ gap: 12 }}>
                <Text>Home</Text>
                <Text>Profile</Text>
                <Text>Settings</Text>
                <Divider />
                <Text colorScheme="muted">Drawer slides from left, right, top, or bottom.</Text>
              </View>
            </DrawerBody>
            <DrawerFooter>
              <Button variant="outline" onPress={() => setShowDrawer(false)}>Close</Button>
            </DrawerFooter>
          </Drawer>
        </View>
      </View>

      {/* Menu Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Menu Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Dropdown menu with actions
        </Text>

        <View style={styles.menuExamples}>
          <Button onPress={() => setShowMenu(true)}>Show Menu</Button>
          <Menu
            visible={showMenu}
            onClose={() => setShowMenu(false)}
            items={menuItems}
            anchor="bottom-start"
          />
        </View>
      </View>

      {/* Tooltip Component */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Tooltip Component</Text>
        <Text variant="body" style={styles.sectionDescription}>
          Contextual information on hover/long press
        </Text>

        <View style={styles.tooltipExamples}>
          <Tooltip content="This is a tooltip!" placement="top">
            <Button variant="outline" size="sm">Hover/Long Press</Button>
          </Tooltip>
          <Tooltip content="Bottom tooltip" placement="bottom">
            <Badge colorScheme="primary">Bottom</Badge>
          </Tooltip>
          <Spacer size={2} />
          <Text variant="caption" colorScheme="muted">
            Hover on web, long press on mobile
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.primary,
  },
  content: {
    padding: tokens.spacing[4],
  },
  title: {
    marginBottom: tokens.spacing[2],
  },
  subtitle: {
    color: tokens.colors.semantic.text.secondary,
    marginBottom: tokens.spacing[8],
  },
  section: {
    marginBottom: tokens.spacing[8],
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.subtle,
  },
  sectionTitle: {
    marginBottom: tokens.spacing[2],
  },
  sectionDescription: {
    color: tokens.colors.semantic.text.secondary,
    marginBottom: tokens.spacing[4],
  },
  textExamples: {
    marginBottom: tokens.spacing[4],
    gap: tokens.spacing[2],
  },
  buttonExamples: {
    gap: tokens.spacing[3],
    alignItems: 'flex-start',
  },
  cardExamples: {
    gap: tokens.spacing[3],
  },
  badgeExamples: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing[2],
    alignItems: 'center',
  },
  inputExamples: {
    gap: tokens.spacing[4],
  },
  iconExamples: {
    gap: tokens.spacing[4],
  },
  iconRow: {
    flexDirection: 'row',
    gap: tokens.spacing[3],
    alignItems: 'center',
  },
  checkboxExamples: {
    gap: tokens.spacing[3],
  },
  radioExamples: {
    gap: tokens.spacing[3],
  },
  switchExamples: {
    gap: tokens.spacing[3],
  },
  spinnerExamples: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing[4],
    alignItems: 'center',
  },
  spinnerRow: {
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  progressExamples: {
    gap: tokens.spacing[4],
  },
  dividerExamples: {
    gap: tokens.spacing[2],
  },
  avatarExamples: {
    gap: tokens.spacing[4],
  },
  avatarRow: {
    flexDirection: 'row',
    gap: tokens.spacing[3],
    alignItems: 'center',
  },
  sliderExamples: {
    gap: tokens.spacing[6],
  },
  textAreaExamples: {
    gap: tokens.spacing[4],
  },
  selectExamples: {
    gap: tokens.spacing[4],
  },
  linkExamples: {
    gap: tokens.spacing[3],
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skeletonExamples: {
    gap: tokens.spacing[4],
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  spacerExamples: {
    gap: tokens.spacing[3],
  },
  toastExamples: {
    gap: tokens.spacing[3],
    alignItems: 'flex-start',
  },
  imageExamples: {
    gap: tokens.spacing[4],
  },
  tabsExamples: {
    gap: tokens.spacing[4],
  },
  breadcrumbExamples: {
    gap: tokens.spacing[3],
  },
  modalExamples: {
    gap: tokens.spacing[3],
    alignItems: 'flex-start',
  },
  drawerExamples: {
    gap: tokens.spacing[3],
    alignItems: 'flex-start',
  },
  menuExamples: {
    gap: tokens.spacing[3],
    alignItems: 'flex-start',
  },
  tooltipExamples: {
    gap: tokens.spacing[3],
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
});
