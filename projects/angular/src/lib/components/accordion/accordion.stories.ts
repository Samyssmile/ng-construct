import { Meta, StoryObj } from '@storybook/angular';
import { Component, input } from '@angular/core';
import { AfAccordionComponent, AfAccordionItemComponent } from './accordion.component';

@Component({
  selector: 'af-accordion-story',
  imports: [AfAccordionComponent, AfAccordionItemComponent],
  template: `
    <af-accordion [multi]="multi()" [bordered]="bordered()">
      <af-accordion-item heading="Getting Started">
        <p>Follow the quick-start guide to set up your project in minutes.</p>
      </af-accordion-item>
      <af-accordion-item heading="Configuration">
        <p>Customise tokens, themes, and component behaviour via CSS custom properties.</p>
      </af-accordion-item>
      <af-accordion-item heading="API Reference">
        <p>Full reference of inputs, outputs, and content-projection slots.</p>
      </af-accordion-item>
    </af-accordion>
  `,
})
class AccordionStoryComponent {
  multi = input(true);
  bordered = input(false);
}

@Component({
  selector: 'af-accordion-disabled-story',
  imports: [AfAccordionComponent, AfAccordionItemComponent],
  template: `
    <af-accordion>
      <af-accordion-item heading="Enabled Section">
        <p>This section can be toggled.</p>
      </af-accordion-item>
      <af-accordion-item heading="Disabled Section" disabled>
        <p>This section is locked.</p>
      </af-accordion-item>
      <af-accordion-item heading="Another Enabled Section">
        <p>This section can also be toggled.</p>
      </af-accordion-item>
    </af-accordion>
  `,
})
class AccordionDisabledStoryComponent {}

@Component({
  selector: 'af-accordion-expanded-story',
  imports: [AfAccordionComponent, AfAccordionItemComponent],
  template: `
    <af-accordion>
      <af-accordion-item heading="Pre-Expanded" [expanded]="true">
        <p>This section starts open.</p>
      </af-accordion-item>
      <af-accordion-item heading="Collapsed">
        <p>This section starts closed.</p>
      </af-accordion-item>
    </af-accordion>
  `,
})
class AccordionExpandedStoryComponent {}

const meta: Meta<AfAccordionComponent> = {
  title: 'Angular/Accordion',
  component: AfAccordionComponent,
  args: {
    multi: true,
    bordered: false,
  },
  argTypes: {
    multi: { control: 'boolean' },
    bordered: { control: 'boolean' },
  },
  render: (args) => ({
    props: args,
    component: AccordionStoryComponent,
  }),
};

export default meta;

export const Default: StoryObj<AfAccordionComponent> = {};

export const Bordered: StoryObj<AfAccordionComponent> = {
  args: { bordered: true },
};

export const SingleExpand: StoryObj<AfAccordionComponent> = {
  args: { multi: false },
};

export const WithDisabledItem: StoryObj<AfAccordionComponent> = {
  render: () => ({
    component: AccordionDisabledStoryComponent,
  }),
};

export const PreExpanded: StoryObj<AfAccordionComponent> = {
  render: () => ({
    component: AccordionExpandedStoryComponent,
  }),
};
