/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

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
const commitPartial = `* {{platform}}{{subject}}
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

module.exports = function generateChangelog(releaseCount) {
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
    headerPattern: /^(\w*): (\[ios\]|\[and\] )?(.*)$/,
    headerCorrespondence: [`type`, `platform`, `subject`],
  };

  function capitalize(str) {
    return str[0].toUpperCase() + str.substr(1);
  }

  const writerOpts = {
    groupBy: 'release',
    transform: function(commit, context) {
      if (commit.type === 'release') context.releases += 1;

      if (commit.platform === '[ios] ') commit.platform = '(iOS) ';
      else if (commit.platform === '[and] ') commit.platform = '(Android) ';
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
    headerPartial,
    commitPartial,
  };

  return conventionalChangelog(
    options,
    context,
    gitRawCommitsOpts,
    parserOpts,
    writerOpts,
  );
};
