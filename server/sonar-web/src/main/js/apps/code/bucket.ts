/*
 * SonarQube
 * Copyright (C) 2009-2021 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

import { Breadcrumb, ComponentMeasure, Dict } from '../../types/types';

let bucket: Dict<ComponentMeasure> = {};
let childrenBucket: Dict<{
  children: ComponentMeasure[];
  page: number;
  total: number;
}> = {};
let breadcrumbsBucket: Dict<Breadcrumb[]> = {};

export function addComponent(component: ComponentMeasure): void {
  bucket[component.key] = component;
}

export function getComponent(componentKey: string): ComponentMeasure {
  return bucket[componentKey];
}

export function addComponentChildren(
  componentKey: string,
  children: ComponentMeasure[],
  total: number,
  page: number
): void {
  const previous = getComponentChildren(componentKey);
  if (previous) {
    children = [...previous.children, ...children];
  }
  childrenBucket[componentKey] = { children, total, page };
}

export function getComponentChildren(
  componentKey: string
): {
  children: ComponentMeasure[];
  page: number;
  total: number;
} {
  return childrenBucket[componentKey];
}

export function addComponentBreadcrumbs(componentKey: string, breadcrumbs: Breadcrumb[]): void {
  breadcrumbsBucket[componentKey] = breadcrumbs;
}

export function getComponentBreadcrumbs(componentKey: string): Breadcrumb[] {
  return breadcrumbsBucket[componentKey];
}

export function clearBucket(): void {
  bucket = {};
  childrenBucket = {};
  breadcrumbsBucket = {};
}
