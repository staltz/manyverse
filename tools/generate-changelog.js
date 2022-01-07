// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const conventionalChangelog = require('conventional-changelog');

const firstReleaseCommit = 'e78c434e0e79201def84bc3d940ba7b953ddaf96';
const mainTemplate = `{{> header}}

{{#if commitGroups.length}}
{{#each commitGroups}}
{{#each commits}}
{{> commit root=@root}}
{{/each}}
{{/each}}
{{else}}
* Minor improvements and bug fixes
{{/if}}

{{> footer}}
`;
const headerPartial = `## {{version}}
`;
const headerNamePartial = `## Manyverse {{version}}
`;
const emojiCommitPartial = `{{emoji}}  {{platform}}{{subject}}
`;
const simpleCommitPartial = `* {{subject}}
`;
const detailedCommitPartial = `* {{platform}}{{subject}}
{{~!-- commit link --}} {{#if @root.linkReferences~}}
  ([see details](
  {{~#if @root.repository}}
    {{~#if @root.host}}
      {{~@root.host}}/
    {{~/if}}
    {{~#if @root.owner}}
      {{~@root.owner}}/
    {{~/if}}
    {{~@root.repository}}
  {{~else}}
    {{~@root.repoUrl}}
  {{~/if}}/
  {{~@root.commit}}/{{hash}}))
{{~else}}
  {{~hash}}
{{~/if}}

{{~!-- commit references --}}
{{~#if references~}}
  , closes
  {{~#each references}} {{#if @root.linkReferences~}}
    [
    {{~#if this.owner}}
      {{~this.owner}}/
    {{~/if}}
    {{~this.repository}}#{{this.issue}}](
    {{~#if @root.repository}}
      {{~#if @root.host}}
        {{~@root.host}}/
      {{~/if}}
      {{~#if this.repository}}
        {{~#if this.owner}}
          {{~this.owner}}/
        {{~/if}}
        {{~this.repository}}
      {{~else}}
        {{~#if @root.owner}}
          {{~@root.owner}}/
        {{~/if}}
          {{~@root.repository}}
        {{~/if}}
    {{~else}}
      {{~@root.repoUrl}}
    {{~/if}}/
    {{~@root.issue}}/{{this.issue}})
  {{~else}}
    {{~#if this.owner}}
      {{~this.owner}}/
    {{~/if}}
    {{~this.repository}}#{{this.issue}}
  {{~/if}}{{/each}}
{{~/if}}

`;

module.exports = function generateChangelog(releaseCount, platform) {
  const options = {
    releaseCount,
  };

  const context = {
    host: 'https://gitlab.com',
    owner: 'staltz',
    repository: 'manyverse',
    releases: 0,
  };

  const gitRawCommitsOpts = {from: firstReleaseCommit};

  const parserOpts = {
    headerPattern: /^(\w*): (\[ios\]|\[and\]|\[des\])? ?(.*)$/,
    headerCorrespondence: [`type`, `platform`, `subject`],
  };

  function capitalize(str) {
    return str[0].toUpperCase() + str.substr(1);
  }

  const writerOpts = {
    groupBy: 'release',
    transform: function (commit, context) {
      if (commit.type === 'release') context.releases += 1;

      if (platform === 'emoji' && commit.type === 'ux') {
        const subject = commit.subject.toLowerCase();
        if (subject.includes('feature')) commit.emoji = '🎉';
        else if (subject.includes('bug fix')) commit.emoji = '✅';
        else if (subject.includes('fix')) commit.emoji = '✅';
        else if (subject.includes('new')) commit.emoji = '🎉';
        else commit.emoji = '🔷';
      }

      if (
        platform === 'ios' &&
        (commit.platform === '[and]' || commit.platform === '[des]')
      ) {
        return false;
      } else if (
        platform === 'and' &&
        (commit.platform === '[ios]' || commit.platform === '[des]')
      ) {
        return false;
      } else if (
        platform === 'des' &&
        (commit.platform === '[and]' || commit.platform === '[ios]')
      ) {
        return false;
      } else if (commit.platform === '[and]') commit.platform = '(Android) ';
      else if (commit.platform === '[ios]') commit.platform = '(iOS) ';
      else if (commit.platform === '[des]') commit.platform = '(Desktop) ';
      else commit.platform = '';

      if (releaseCount > 0 && context.releases >= releaseCount + 1) {
        return false;
      } else if (commit.type === 'ux') {
        commit.subject = capitalize(commit.subject);
        return commit;
      } else {
        return false;
      }
    },
    generateOn: (commit, _commits, context) => {
      if (releaseCount > 0 && context.releases >= releaseCount + 1) {
        return false;
      }
      if (commit.type === 'release') {
        return true;
      }
      return false;
    },
    mainTemplate,
    headerPartial:
      platform === 'ios' || platform === 'and' || platform === 'des'
        ? ''
        : platform === 'emoji'
        ? headerNamePartial
        : headerPartial,
    commitPartial:
      platform === 'ios' || platform === 'and' || platform === 'des'
        ? simpleCommitPartial
        : platform === 'emoji'
        ? emojiCommitPartial
        : detailedCommitPartial,
  };

  return conventionalChangelog(
    options,
    context,
    gitRawCommitsOpts,
    parserOpts,
    writerOpts,
  );
};
